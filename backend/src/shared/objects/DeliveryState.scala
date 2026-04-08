package delivery.shared.objects

import delivery.model.*
import delivery.store.SeedBootstrap

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
