package delivery.rider.objects

import delivery.order.objects.Order

final case class RiderMeResponse(
    username: String,
    role: String,
    riderAccount: RiderAccountPublic,
    availableOrders: List[Order]
)
