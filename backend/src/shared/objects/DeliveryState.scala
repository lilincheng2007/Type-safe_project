package delivery.shared.objects

import delivery.admin.state.AdminServiceState
import delivery.merchant.state.MerchantServiceState
import delivery.order.state.OrderServiceState
import delivery.rider.state.RiderServiceState
import delivery.shared.bootstrap.SeedBootstrap
import delivery.user.state.UserServiceState

final case class DeliveryState(
    user: UserServiceState,
    order: OrderServiceState,
    merchant: MerchantServiceState,
    rider: RiderServiceState,
    admin: AdminServiceState
)

object DeliveryState:
  val seed: DeliveryState =
    DeliveryState(
      user = SeedBootstrap.userState,
      order = SeedBootstrap.orderState,
      merchant = SeedBootstrap.merchantState,
      rider = SeedBootstrap.riderState,
      admin = SeedBootstrap.adminState
    )

end DeliveryState
