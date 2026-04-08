package delivery.order.objects

import delivery.model.Order

final case class CheckoutResponse(orders: List[Order], walletBalance: Double)
