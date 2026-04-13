package delivery.merchant.repository

import delivery.shared.objects.DeliveryState

object MerchantRepository:

  def findMerchantAccount(state: DeliveryState, username: String): Option[delivery.model.MerchantAccount] =
    state.merchant.merchantAccounts.find(_.username == username)

  def withMerchantState(state: DeliveryState, nextMerchant: delivery.model.MerchantServiceState): DeliveryState =
    state.copy(merchant = nextMerchant)

end MerchantRepository
