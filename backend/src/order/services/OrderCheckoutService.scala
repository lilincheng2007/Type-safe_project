package delivery.order.services

import cats.effect.IO
import delivery.merchant.objects.{Merchant, Product}
import delivery.merchant.services.MerchantBusinessHoursService
import delivery.order.objects.{CheckoutLine, Order, OrderPriceBreakdown}
import delivery.order.objects.apiTypes.OrderMerchantNote
import delivery.order.validators.CheckoutLineValidator
import delivery.domain.{MerchantId, Promotion, Voucher, VoucherId}
import delivery.promotion.services.{PromotionPricing, VoucherRedemptionService}
import delivery.user.objects.CustomerProfile

object OrderCheckoutService:

  final case class CheckoutBuild(
      orders: List[Order],
      originalAmount: Double,
      discountAmount: Double,
      payableAmount: Double,
      usedVoucher: Option[Voucher],
      priceBreakdown: OrderPriceBreakdown
  )

  def buildOrdersForCheckout(
      products: List[Product],
      merchants: List[Merchant],
      platformPromotions: List[Promotion],
      customerProfile: CustomerProfile,
      lines: List[CheckoutLine],
      voucherId: Option[VoucherId],
      merchantNotes: List[OrderMerchantNote] = Nil
  ): IO[Either[String, CheckoutBuild]] =
    if lines.isEmpty then IO.pure(Left("购物车为空"))
    else
      for
        nowMillis <- IO.realTime.map(_.toMillis)
        zoneId <- IO.delay(java.time.ZoneId.systemDefault())
      yield
        val grouped = lines.groupBy(_.merchantId).toList
        val productsById = products.map(product => product.id -> product).toMap
        val lineValidationError = CheckoutLineValidator.validateLines(productsById, lines)
        val inventoryValidationError = CheckoutLineValidator.validateInventory(productsById, lines)
        val bundleValidationError = CheckoutLineValidator.validateBundleLines(productsById, lines)
        val notesByMerchant = normalizeMerchantNotes(merchantNotes)
        if lineValidationError.nonEmpty then Left(lineValidationError.get)
        else if inventoryValidationError.nonEmpty then Left(inventoryValidationError.get)
        else if bundleValidationError.nonEmpty then Left(bundleValidationError.get)
        else
          val merchantsById = merchants.map(merchant => merchant.id -> merchant).toMap
          val closedMerchantMessage = grouped.flatMap { case (merchantId, _) =>
            merchantsById.get(merchantId).filterNot(MerchantBusinessHoursService.isAcceptingOrders(_)).map(merchant => MerchantBusinessHoursService.unavailableMessage(merchant))
          }.headOption
          val rawOrders = CheckoutOrderFactory.buildRawOrders(grouped, products, merchantsById, productsById)

          if closedMerchantMessage.nonEmpty then Left(closedMerchantMessage.get)
          else if rawOrders.isEmpty then Left("无法解析购物车商品")
          else
            val originalAmount = CheckoutPricingService.roundMoney(rawOrders.map(_.originalAmount).sum)
            val merchantDiscountAmount = CheckoutPricingService.roundMoney(rawOrders.map(_.merchantDiscount).sum)
            val afterMerchantDiscountAmount = CheckoutPricingService.roundMoney(rawOrders.map(_.merchantReceivable).sum)
            val itemCount = rawOrders.flatMap(_.items).map(_.quantity).sum
            VoucherRedemptionService.validateVoucher(customerProfile, voucherId, afterMerchantDiscountAmount).flatMap { usedVoucher =>
              val voucherDiscount = usedVoucher.map(voucher => math.min(voucher.discountAmount, afterMerchantDiscountAmount)).getOrElse(0.0)
              val promotionItems = rawOrders.flatMap(_.items).map(item => PromotionPricing.PromotionItem(item.productId, item.unitPrice, item.quantity))
              val platformPromotion = PromotionPricing.bestForItems(platformPromotions, afterMerchantDiscountAmount - voucherDiscount, itemCount, promotionItems)
              val platformDiscount = platformPromotion.map(_.discountAmount).getOrElse(0.0)
              val discountAmount = CheckoutPricingService.roundMoney(merchantDiscountAmount + voucherDiscount + platformDiscount)
              val customerOnlyDiscount = CheckoutPricingService.roundMoney(voucherDiscount + platformDiscount)
              val payableAmount = CheckoutPricingService.roundMoney(afterMerchantDiscountAmount - customerOnlyDiscount)
              if customerProfile.walletBalance < payableAmount then Left("余额不足")
              else
                val orders = CheckoutOrderFactory.buildOrders(
                  rawOrders = rawOrders,
                  customerProfile = customerProfile,
                  usedVoucher = usedVoucher,
                  voucherDiscount = voucherDiscount,
                  platformPromotion = platformPromotion,
                  platformDiscount = platformDiscount,
                  notesByMerchant = notesByMerchant,
                  nowMillis = nowMillis,
                  zoneId = zoneId
                )
                val checkoutBreakdown = CheckoutPricingService.priceBreakdown(
                  productOriginalAmount = originalAmount,
                  merchantDiscountAmount = merchantDiscountAmount,
                  voucherDiscountAmount = voucherDiscount,
                  platformDiscountAmount = platformDiscount,
                  deliveryFeeAmount = 0,
                  payableAmount = payableAmount
                )
                Right(CheckoutBuild(orders.reverse, originalAmount, discountAmount, payableAmount, usedVoucher, checkoutBreakdown))
            }

  private def normalizeMerchantNotes(merchantNotes: List[OrderMerchantNote]): Map[MerchantId, OrderMerchantNote] =
    merchantNotes
      .map(note => note.copy(text = note.text.map(_.trim).filter(_.nonEmpty), imageUrl = note.imageUrl.map(_.trim).filter(_.nonEmpty)))
      .filter(note => note.text.nonEmpty || note.imageUrl.nonEmpty)
      .map(note => note.merchantId -> note)
      .toMap

end OrderCheckoutService
