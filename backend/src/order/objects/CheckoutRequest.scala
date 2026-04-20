package delivery.order.objects

final case class CheckoutRequest(
    lines: List[CheckoutLine],
    customerName: Option[String] = None,
    customerPhone: Option[String] = None,
    deliveryAddress: Option[String] = None
)
