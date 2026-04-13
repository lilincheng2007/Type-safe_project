package delivery.order.repository

import delivery.shared.objects.DeliveryState

object OrderRepository:

  def withOrderAndMerchantAndUserState(
      state: DeliveryState,
      nextUser: delivery.model.UserServiceState,
      nextOrder: delivery.model.OrderServiceState,
      nextMerchant: delivery.model.MerchantServiceState
  ): DeliveryState =
    state.copy(user = nextUser, order = nextOrder, merchant = nextMerchant)

end OrderRepository
