package delivery.store

import delivery.model.*

object AccountStoreBuilder:

  def splitOrdersByHistory(source: List[Order]): (List[Order], List[Order]) =
    val pending = source.filter(o => o.status != "已完成" && o.status != "已取消")
    val history = source.filter(o => o.status == "已完成" || o.status == "已取消")
    (pending, history)

  def build(
      customers: List[Customer],
      merchants: List[Merchant],
      products: List[Product],
      riders: List[Rider],
      orders: List[Order]
  ): AccountStore =
    val customerAccounts = customers.zipWithIndex.map { case (customer, index) =>
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

    val merchantAccounts = merchants.zipWithIndex.map { case (merchant, index) =>
      val merchantOrders = orders.filter(_.merchantId == merchant.id)
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
              products = products.filter(_.merchantId == merchant.id),
              pendingOrders = pending,
              historyOrders = history
            )
          )
        )
      )
    }

    val riderAccounts = riders.zipWithIndex.map { case (rider, index) =>
      val riderOrders = orders.filter(_.riderId.contains(rider.id))
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

    val adminAccounts = List(
      AdminAccount(role = "admin", username = "admin", password = "123456", displayName = "平台管理员")
    )

    AccountStore(customerAccounts, merchantAccounts, riderAccounts, adminAccounts)

  def initialAppState: AppState =
    val orders = SeedData.seedOrders
    AppState(
      customers = SeedData.seedCustomers,
      catalogMerchants = SeedData.seedMerchants,
      catalogProducts = SeedData.seedProducts,
      riders = SeedData.seedRiders,
      orders = orders,
      accountStore = build(
        SeedData.seedCustomers,
        SeedData.seedMerchants,
        SeedData.seedProducts,
        SeedData.seedRiders,
        orders
      ),
      serviceAgents = SeedData.seedServiceAgents,
      operationsManagers = SeedData.seedOperationsManagers,
      merchantApplications = SeedData.seedMerchantApplications,
      complaintTickets = SeedData.seedComplaintTickets,
      campaigns = SeedData.seedCampaigns
    )

end AccountStoreBuilder
