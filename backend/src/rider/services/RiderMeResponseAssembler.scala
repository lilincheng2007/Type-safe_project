package delivery.rider.services

import delivery.order.objects.Order
import delivery.rider.objects.{RiderAccountPublic, RiderDeliveryStatus}
import delivery.rider.objects.apiTypes.RiderMeResponse
import delivery.rider.tables.RiderAccountRecord
import delivery.domain.UserRole

object RiderMeResponseAssembler:

  def assemble(
      username: String,
      account: RiderAccountRecord,
      availableOrders: List[Order],
      deliveryStatuses: List[RiderDeliveryStatus] = Nil
  ): RiderMeResponse =
    RiderMeResponse(
      username = username,
      role = UserRole.rider,
      riderAccount = RiderAccountPublic(UserRole.rider, account.username, account.profile),
      availableOrders = availableOrders,
      deliveryStatuses = deliveryStatuses
    )

end RiderMeResponseAssembler
