package delivery.order.objects

final case class CheckoutResponse(orders: List[Order], walletBalance: Double)
