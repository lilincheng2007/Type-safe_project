package delivery.order.services

import delivery.order.objects.{OrderPriceBreakdown, OrderPriceBreakdownLine}

object CheckoutPricingService:

  def roundMoney(value: Double): Double =
    BigDecimal(value).setScale(2, BigDecimal.RoundingMode.HALF_UP).toDouble

  def priceBreakdown(
      productOriginalAmount: Double,
      merchantDiscountAmount: Double,
      voucherDiscountAmount: Double,
      platformDiscountAmount: Double,
      deliveryFeeAmount: Double,
      payableAmount: Double
  ): OrderPriceBreakdown =
    val discountAmount = roundMoney(merchantDiscountAmount + voucherDiscountAmount + platformDiscountAmount)
    val lines = List(
      Some(OrderPriceBreakdownLine("productOriginalAmount", "商品原价", productOriginalAmount, "charge")),
      Option.when(merchantDiscountAmount > 0)(OrderPriceBreakdownLine("merchantDiscountAmount", "商家优惠", merchantDiscountAmount, "discount")),
      Option.when(voucherDiscountAmount > 0)(OrderPriceBreakdownLine("voucherDiscountAmount", "优惠券抵扣", voucherDiscountAmount, "discount")),
      Option.when(platformDiscountAmount > 0)(OrderPriceBreakdownLine("platformDiscountAmount", "平台优惠", platformDiscountAmount, "discount")),
      Some(OrderPriceBreakdownLine("deliveryFeeAmount", "配送费", deliveryFeeAmount, "charge")),
      Some(OrderPriceBreakdownLine("discountAmount", "优惠抵扣合计", discountAmount, "discount")),
      Some(OrderPriceBreakdownLine("payableAmount", "实付金额", payableAmount, "total"))
    ).flatten
    OrderPriceBreakdown(
      lines = lines,
      productOriginalAmount = productOriginalAmount,
      merchantDiscountAmount = merchantDiscountAmount,
      voucherDiscountAmount = voucherDiscountAmount,
      platformDiscountAmount = platformDiscountAmount,
      deliveryFeeAmount = deliveryFeeAmount,
      discountAmount = discountAmount,
      payableAmount = payableAmount
    )

  def allocateDiscount(totalDiscount: Double, totalBase: Double, currentBase: Double, previousAllocated: Double, isLast: Boolean): Double =
    if totalDiscount <= 0 || totalBase <= 0 then 0
    else if isLast then roundMoney(totalDiscount - previousAllocated)
    else roundMoney(totalDiscount * currentBase / totalBase)

end CheckoutPricingService
