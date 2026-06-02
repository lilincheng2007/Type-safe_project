package delivery.rider.objects.apiTypes

import delivery.order.objects.Order
import delivery.rider.objects.{RiderAccountPublic, RiderDeliveryStatus}
import delivery.shared.objects.UserRole

final case class RiderMeResponse(
    username: String,
    role: UserRole,
    riderAccount: RiderAccountPublic,
    availableOrders: List[Order],
    deliveryStatuses: List[RiderDeliveryStatus] = Nil
)
