package delivery.order.services

import delivery.merchant.objects.{Merchant, Product, ProductBundleGroup, ProductBundleOption}
import delivery.order.objects.{CheckoutLine, Order, OrderItem, OrderPriceSnapshot, OrderPriceSnapshotItem, OrderTimelineEvent}
import delivery.order.objects.apiTypes.OrderMerchantNote
import delivery.domain.{MerchantId, OrderStatus, ProductId, Promotion, Voucher}
import delivery.promotion.services.PromotionPricing
import delivery.user.objects.CustomerProfile

import java.time.ZoneId

object CheckoutOrderFactory:

  final case class RawOrder(
      merchantId: MerchantId,
      items: List[OrderItem],
      originalAmount: Double,
      merchantDiscount: Double,
      merchantReceivable: Double,
      appliedMerchantPromotion: Option[Promotion]
  )

  def buildRawOrders(
      groupedLines: List[(MerchantId, List[CheckoutLine])],
      products: List[Product],
      merchantsById: Map[MerchantId, Merchant],
      productsById: Map[ProductId, Product]
  ): List[RawOrder] =
    groupedLines.flatMap { case (merchantId, groupLines) =>
      val items = groupLines.flatMap { line =>
        products
          .find(product => product.id == line.productId && product.merchantId == merchantId)
          .map(product => OrderItem(product.id, orderItemName(product, line, productsById), bundleLinePrice(product, line, productsById), line.quantity))
      }
      if items.isEmpty then None
      else
        val original = CheckoutPricingService.roundMoney(items.map(item => item.unitPrice * item.quantity).sum)
        val itemCount = items.map(_.quantity).sum
        val promotionItems = items.map(item => PromotionPricing.PromotionItem(item.productId, item.unitPrice, item.quantity))
        val merchantPromotion = merchantsById.get(merchantId).flatMap(merchant => PromotionPricing.bestForItems(merchant.promotions, original, itemCount, promotionItems))
        val merchantDiscount = merchantPromotion.map(_.discountAmount).getOrElse(0.0)
        val merchantReceivable = CheckoutPricingService.roundMoney(original - merchantDiscount)
        Some(RawOrder(merchantId, items, original, merchantDiscount, merchantReceivable, merchantPromotion.map(_.promotion)))
    }

  def buildOrders(
      rawOrders: List[RawOrder],
      customerProfile: CustomerProfile,
      usedVoucher: Option[Voucher],
      voucherDiscount: Double,
      platformPromotion: Option[PromotionPricing.AppliedPromotion],
      platformDiscount: Double,
      notesByMerchant: Map[MerchantId, OrderMerchantNote],
      nowMillis: Long,
      zoneId: ZoneId
  ): List[Order] =
    val afterMerchantDiscountAmount = CheckoutPricingService.roundMoney(rawOrders.map(_.merchantReceivable).sum)
    val now = java.time.Instant.ofEpochMilli(nowMillis).atZone(zoneId).toLocalDateTime
    val orderTimeText = f"${now.getYear}%04d-${now.getMonthValue}%02d-${now.getDayOfMonth}%02d ${now.getHour}%02d:${now.getMinute}%02d"
    rawOrders.zipWithIndex.map { case (rawOrder, idx) =>
      val previousVoucherDiscount = rawOrders.take(idx).map(raw => CheckoutPricingService.allocateDiscount(voucherDiscount, afterMerchantDiscountAmount, raw.merchantReceivable, 0, isLast = false)).sum
      val previousPlatformDiscount = rawOrders.take(idx).map(raw => CheckoutPricingService.allocateDiscount(platformDiscount, afterMerchantDiscountAmount, raw.merchantReceivable, 0, isLast = false)).sum
      val isLastOrder = idx == rawOrders.size - 1
      val voucherOrderDiscount = CheckoutPricingService.allocateDiscount(voucherDiscount, afterMerchantDiscountAmount, rawOrder.merchantReceivable, previousVoucherDiscount, isLastOrder)
      val platformOrderDiscount = CheckoutPricingService.allocateDiscount(platformDiscount, afterMerchantDiscountAmount, rawOrder.merchantReceivable, previousPlatformDiscount, isLastOrder)
      val customerOnlyOrderDiscount = CheckoutPricingService.roundMoney(voucherOrderDiscount + platformOrderDiscount)
      val orderDiscount = CheckoutPricingService.roundMoney(rawOrder.merchantDiscount + customerOnlyOrderDiscount)
      val orderPayable = CheckoutPricingService.roundMoney(rawOrder.merchantReceivable - customerOnlyOrderDiscount)
      val note = notesByMerchant.get(rawOrder.merchantId)
      val appliedPromotions = List(rawOrder.appliedMerchantPromotion, platformPromotion.map(_.promotion)).flatten
      val breakdown = CheckoutPricingService.priceBreakdown(
        productOriginalAmount = rawOrder.originalAmount,
        merchantDiscountAmount = rawOrder.merchantDiscount,
        voucherDiscountAmount = voucherOrderDiscount,
        platformDiscountAmount = platformOrderDiscount,
        deliveryFeeAmount = 0,
        payableAmount = orderPayable
      )
      val snapshot = OrderPriceSnapshot(
        items = rawOrder.items.map(item => OrderPriceSnapshotItem(item.productId, item.name, item.unitPrice, item.quantity, CheckoutPricingService.roundMoney(item.unitPrice * item.quantity))),
        productOriginalAmount = rawOrder.originalAmount,
        merchantDiscountAmount = rawOrder.merchantDiscount,
        voucherDiscountAmount = voucherOrderDiscount,
        platformDiscountAmount = platformOrderDiscount,
        deliveryFeeAmount = 0,
        discountAmount = orderDiscount,
        payableAmount = orderPayable,
        merchantReceivableAmount = rawOrder.merchantReceivable,
        appliedPromotionTitles = appliedPromotions.map(_.title),
        usedVoucherTitle = usedVoucher.map(_.title)
      )
      Order(
        id = s"o-$nowMillis-${idx + 1}",
        customerId = customerProfile.id,
        customerName = customerProfile.name,
        customerPhone = customerProfile.phone,
        merchantId = rawOrder.merchantId,
        riderId = None,
        items = rawOrder.items,
        totalAmount = orderPayable,
        deliveryAddress = customerProfile.defaultAddress,
        status = OrderStatus.待商家接单,
        placedAt = orderTimeText,
        originalAmount = rawOrder.originalAmount,
        discountAmount = orderDiscount,
        payableAmount = orderPayable,
        usedVoucher = usedVoucher,
        merchantDiscountAmount = rawOrder.merchantDiscount,
        platformDiscountAmount = customerOnlyOrderDiscount,
        merchantReceivableAmount = rawOrder.merchantReceivable,
        appliedPromotions = appliedPromotions,
        priceSnapshot = Some(snapshot),
        priceBreakdown = Some(breakdown),
        pointsAwarded = 0,
        customerNoteText = note.flatMap(_.text),
        customerNoteImageUrl = note.flatMap(_.imageUrl),
        statusTimeline = List(OrderTimelineEvent("placed", "已下单", orderTimeText, Some("订单已提交，等待商家接单")))
      )
    }

  private def orderItemName(product: Product, line: CheckoutLine, productsById: Map[ProductId, Product]): String =
    if product.bundleGroups.isEmpty then
      val names = line.bundleSelections
        .flatMap(selection => productsById.get(selection.productId).map(item => s"${item.name}x${selection.quantity}"))
        .mkString("、")
      if names.isEmpty then product.name else s"${product.name}（套餐内容：$names）"
    else
      val summary = product.bundleGroups.flatMap { group =>
        val selected = line.bundleSelections.filter(_.groupId == group.id)
        if selected.isEmpty then None
        else
          val names = selected
            .flatMap(selection => productsById.get(selection.productId).map(item => s"${item.name}x${selection.quantity}"))
            .mkString("、")
          Some(s"${group.name}：$names")
      }.mkString("；")
      if summary.isEmpty then product.name else s"${product.name}（$summary）"

  private def bundleOptionExtraPrice(group: ProductBundleGroup, option: ProductBundleOption, optionProduct: Product): Double =
    if option.customExtraPrice || option.extraPrice > 0 then math.max(0, option.extraPrice)
    else if group.includedPrice > 0 then math.max(0, optionProduct.price - group.includedPrice)
    else 0

  private def bundleLinePrice(product: Product, line: CheckoutLine, productsById: Map[ProductId, Product]): Double =
    if product.bundleGroups.isEmpty then product.price
    else
      val extra = product.bundleGroups.map { group =>
        line.bundleSelections
          .filter(_.groupId == group.id)
          .flatMap { selection =>
            for
              option <- group.options.find(_.productId == selection.productId)
              optionProduct <- productsById.get(selection.productId)
            yield bundleOptionExtraPrice(group, option, optionProduct) * selection.quantity
          }
          .sum
      }.sum
      CheckoutPricingService.roundMoney(product.price + extra)

end CheckoutOrderFactory
