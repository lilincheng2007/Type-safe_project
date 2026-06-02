package delivery.rider.objects.apiTypes

import delivery.order.objects.Order

final case class RiderAvailableOrdersResponse(orders: List[Order])
