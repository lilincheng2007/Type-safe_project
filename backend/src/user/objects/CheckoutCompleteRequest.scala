package delivery.user.objects

import delivery.order.objects.Order

final case class CheckoutCompleteRequest(username: String, orders: List[Order], totalDebit: Double)
