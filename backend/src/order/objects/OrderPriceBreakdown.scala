package delivery.order.objects

final case class OrderPriceBreakdownLine(
    key: String,
    label: String,
    amount: Double,
    kind: String
)

final case class OrderPriceBreakdown(
    lines: List[OrderPriceBreakdownLine],
    productOriginalAmount: Double,
    merchantDiscountAmount: Double,
    voucherDiscountAmount: Double,
    platformDiscountAmount: Double,
    deliveryFeeAmount: Double,
    discountAmount: Double,
    payableAmount: Double
)
