package delivery.shared.state

import delivery.merchant.state.MerchantServiceState
import delivery.order.state.OrderServiceState
import delivery.rider.state.RiderServiceState
import delivery.shared.objects.DeliveryState
import delivery.user.state.UserServiceState

object DeliveryStateOps:

  def withUserState(state: DeliveryState, nextUser: UserServiceState): DeliveryState =
    state.copy(user = nextUser)

  def withMerchantState(state: DeliveryState, nextMerchant: MerchantServiceState): DeliveryState =
    state.copy(merchant = nextMerchant)

  def withUserAndMerchantState(
      state: DeliveryState,
      nextUser: UserServiceState,
      nextMerchant: MerchantServiceState
  ): DeliveryState =
    state.copy(user = nextUser, merchant = nextMerchant)

  def withUserAndRiderState(
      state: DeliveryState,
      nextUser: UserServiceState,
      nextRider: RiderServiceState
  ): DeliveryState =
    state.copy(user = nextUser, rider = nextRider)

  def withOrderAndMerchantAndUserState(
      state: DeliveryState,
      nextUser: UserServiceState,
      nextOrder: OrderServiceState,
      nextMerchant: MerchantServiceState
  ): DeliveryState =
    state.copy(user = nextUser, order = nextOrder, merchant = nextMerchant)

  def withOrderAndMerchantAndUserAndRiderState(
      state: DeliveryState,
      nextUser: UserServiceState,
      nextOrder: OrderServiceState,
      nextMerchant: MerchantServiceState,
      nextRider: RiderServiceState
  ): DeliveryState =
    state.copy(user = nextUser, order = nextOrder, merchant = nextMerchant, rider = nextRider)

end DeliveryStateOps
