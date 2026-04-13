package delivery.rider.repository

import delivery.shared.objects.DeliveryState

object RiderRepository:

  def findRiderAccount(state: DeliveryState, username: String): Option[delivery.model.RiderAccount] =
    state.rider.riderAccounts.find(_.username == username)

end RiderRepository
