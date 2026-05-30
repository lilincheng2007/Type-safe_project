package delivery.rider.objects

import delivery.order.objects.Order

final case class RiderAvailableOrdersResponse(orders: List[Order])
