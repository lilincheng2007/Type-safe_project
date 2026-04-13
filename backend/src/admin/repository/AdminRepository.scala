package delivery.admin.repository

import delivery.shared.objects.DeliveryState

object AdminRepository:

  def findAdminAccount(state: DeliveryState, username: String): Option[delivery.model.AdminAccount] =
    state.admin.adminAccounts.find(_.username == username)

end AdminRepository
