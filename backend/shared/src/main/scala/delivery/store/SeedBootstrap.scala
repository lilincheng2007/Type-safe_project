package delivery.store

import delivery.model.*

/** 从原单体种子拆成各服务初始快照，保证演示数据一致。 */
object SeedBootstrap:

  private lazy val app: AppState = AccountStoreBuilder.initialAppState

  val userState: UserServiceState =
    UserServiceState(
      customers = app.customers,
      customerAccounts = app.accountStore.customerAccounts,
      authCredentials =
        app.accountStore.customerAccounts.map(a => AuthCredential(a.role, a.username, a.password)) ++
          app.accountStore.merchantAccounts.map(a => AuthCredential(a.role, a.username, a.password)) ++
          app.accountStore.riderAccounts.map(a => AuthCredential(a.role, a.username, a.password)) ++
          app.accountStore.adminAccounts.map(a => AuthCredential(a.role, a.username, a.password))
    )

  val merchantState: MerchantServiceState =
    MerchantServiceState(
      merchantAccounts = app.accountStore.merchantAccounts,
      catalogMerchants = app.catalogMerchants,
      catalogProducts = app.catalogProducts
    )

  val riderState: RiderServiceState =
    RiderServiceState(riders = app.riders, riderAccounts = app.accountStore.riderAccounts)

  val adminState: AdminServiceState =
    AdminServiceState(
      adminAccounts = app.accountStore.adminAccounts,
      serviceAgents = app.serviceAgents,
      operationsManagers = app.operationsManagers,
      merchantApplications = app.merchantApplications,
      complaintTickets = app.complaintTickets,
      campaigns = app.campaigns
    )

  val orderState: OrderServiceState = OrderServiceState(orders = app.orders)

end SeedBootstrap
