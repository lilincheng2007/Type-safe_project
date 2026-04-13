package delivery.user.repository

import delivery.shared.objects.DeliveryState

object UserRepository:

  def findCustomerAccount(state: DeliveryState, username: String): Option[delivery.model.CustomerAccount] =
    state.user.customerAccounts.find(_.username == username)

  def withUserState(state: DeliveryState, nextUser: delivery.model.UserServiceState): DeliveryState =
    state.copy(user = nextUser)

  def withUserAndMerchantState(
      state: DeliveryState,
      nextUser: delivery.model.UserServiceState,
      nextMerchant: delivery.model.MerchantServiceState
  ): DeliveryState =
    state.copy(user = nextUser, merchant = nextMerchant)

  def withUserAndRiderState(
      state: DeliveryState,
      nextUser: delivery.model.UserServiceState,
      nextRider: delivery.model.RiderServiceState
  ): DeliveryState =
    state.copy(user = nextUser, rider = nextRider)

end UserRepository
