package delivery.rider.objects

import delivery.order.objects.Order

final case class RiderUpdateOrderStatusResponse(
    ok: Boolean,
    order: Order
)
