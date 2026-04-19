package delivery.order.state

import delivery.order.objects.Order

final case class OrderServiceState(
    orders: List[Order]
)
