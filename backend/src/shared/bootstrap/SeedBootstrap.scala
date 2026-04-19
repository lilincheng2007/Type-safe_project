package delivery.shared.bootstrap

import delivery.admin.objects.*
import delivery.admin.state.*
import delivery.merchant.objects.*
import delivery.merchant.state.*
import delivery.order.objects.*
import delivery.order.state.*
import delivery.rider.objects.*
import delivery.rider.state.*
import delivery.user.objects.{Customer, CustomerProfile}
import delivery.user.state.*

object SeedBootstrap:

  private def splitOrdersByHistory(source: List[Order]): (List[Order], List[Order]) =
    val pending = source.filter(o => o.status != "已完成" && o.status != "已取消")
    val history = source.filter(o => o.status == "已完成" || o.status == "已取消")
    (pending, history)

  lazy val userState: UserServiceState =
    val orders = SeedData.seedOrders
    val customerAccounts = SeedData.seedCustomers.zipWithIndex.map { case (customer, index) =>
      val related = orders.filter(_.customerId == customer.id)
      val (pending, history) = splitOrdersByHistory(related)
      CustomerAccount(
        role = "customer",
        username = if index == 0 then "customer_demo" else s"customer_${index + 1}",
        password = "123456",
        profile = CustomerProfile(
          id = customer.id,
          name = customer.name,
          phone = customer.phone,
          defaultAddress = customer.defaultAddress,
          vouchers = customer.vouchers,
          walletBalance = customer.walletBalance,
          pendingOrders = pending,
          historyOrders = history
        )
      )
    }

    val authCredentials =
      customerAccounts.map(a => AuthCredential(a.role, a.username, a.password)) ++
        merchantState.merchantAccounts.map(a => AuthCredential(a.role, a.username, a.password)) ++
        riderState.riderAccounts.map(a => AuthCredential(a.role, a.username, a.password)) ++
        adminState.adminAccounts.map(a => AuthCredential(a.role, a.username, a.password))

    UserServiceState(
      customers = SeedData.seedCustomers,
      customerAccounts = customerAccounts,
      authCredentials = authCredentials
    )

  lazy val merchantState: MerchantServiceState =
    val merchantAccounts = SeedData.seedMerchants.zipWithIndex.map { case (merchant, index) =>
      val merchantOrders = SeedData.seedOrders.filter(_.merchantId == merchant.id)
      val (pending, history) = splitOrdersByHistory(merchantOrders)
      MerchantAccount(
        role = "merchant",
        username = if index == 0 then "merchant_demo" else s"merchant_${index + 1}",
        password = "123456",
        profile = MerchantProfile(
          id = s"merchant-profile-${merchant.id}",
          ownerName = merchant.storeName,
          phone = merchant.phone,
          stores = List(
            MerchantStoreProfile(
              merchant = merchant,
              products = SeedData.seedProducts.filter(_.merchantId == merchant.id),
              pendingOrders = pending,
              historyOrders = history
            )
          )
        )
      )
    }

    MerchantServiceState(
      merchantAccounts = merchantAccounts,
      catalogMerchants = SeedData.seedMerchants,
      catalogProducts = SeedData.seedProducts
    )

  lazy val riderState: RiderServiceState =
    val riderAccounts = SeedData.seedRiders.zipWithIndex.map { case (rider, index) =>
      val riderOrders = SeedData.seedOrders.filter(_.riderId.contains(rider.id))
      val (pending, history) = splitOrdersByHistory(riderOrders)
      RiderAccount(
        role = "rider",
        username = if index == 0 then "rider_demo" else s"rider_${index + 1}",
        password = "123456",
        profile = RiderProfile(
          rider = rider,
          walletBalance = math.round(rider.salary * 0.1).toDouble,
          pendingOrders = pending,
          historyOrders = history
        )
      )
    }

    RiderServiceState(riders = SeedData.seedRiders, riderAccounts = riderAccounts)

  lazy val adminState: AdminServiceState =
    AdminServiceState(
      adminAccounts = List(AdminAccount(role = "admin", username = "admin", password = "123456", displayName = "平台管理员")),
      serviceAgents = SeedData.seedServiceAgents,
      operationsManagers = SeedData.seedOperationsManagers,
      merchantApplications = SeedData.seedMerchantApplications,
      complaintTickets = SeedData.seedComplaintTickets,
      campaigns = SeedData.seedCampaigns
    )

  lazy val orderState: OrderServiceState =
    OrderServiceState(orders = SeedData.seedOrders)

end SeedBootstrap
