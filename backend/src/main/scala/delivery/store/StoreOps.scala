package delivery.store

import delivery.model.*

object StoreOps:

  def verifyLogin(state: AppState, role: String, username: String, password: String): Either[String, Unit] =
    val store = state.accountStore
    val matched = role match
      case "customer" => store.customerAccounts.find(_.username == username).map(_.password)
      case "merchant" => store.merchantAccounts.find(_.username == username).map(_.password)
      case "rider"    => store.riderAccounts.find(_.username == username).map(_.password)
      case "admin"    => store.adminAccounts.find(_.username == username).map(_.password)
      case _          => None
    matched match
      case None                     => Left(s"未找到该角色下的账号：$username")
      case Some(p) if p != password => Left("密码错误，请重新输入。")
      case Some(_)                  => Right(())

  def register(state: AppState, role: String, username: String, password: String)
      : Either[String, AppState] =
    val store = state.accountStore
    if role == "admin" then Left("不可注册管理员")
    else
      val exists = role match
        case "customer" => store.customerAccounts.exists(_.username == username)
        case "merchant" => store.merchantAccounts.exists(_.username == username)
        case "rider"    => store.riderAccounts.exists(_.username == username)
        case _          => true
      if exists then Left("该角色下账号已存在。")
      else
        role match
          case "customer" =>
            val newCustomer = Customer(
              id = s"u-${System.currentTimeMillis()}",
              name = username,
              phone = "",
              defaultAddress = "请完善默认收货地址",
              walletBalance = 0,
              orderHistoryIds = Nil,
              vouchers = Nil
            )
            val acc = CustomerAccount(
              "customer",
              username,
              password,
              CustomerProfile(
                newCustomer.id,
                newCustomer.name,
                newCustomer.phone,
                newCustomer.defaultAddress,
                Nil,
                0,
                Nil,
                Nil
              )
            )
            Right(
              state.copy(
                customers = state.customers :+ newCustomer,
                accountStore = store.copy(customerAccounts = store.customerAccounts :+ acc)
              )
            )
          case "merchant" =>
            val newMerchant = Merchant(
              id = s"m-${System.currentTimeMillis()}",
              storeName = s"${username}的店铺",
              category = "中餐",
              address = "请完善店铺地址",
              phone = "",
              rating = 5,
              tags = Nil,
              featuredProductIds = Nil
            )
            val acc = MerchantAccount(
              "merchant",
              username,
              password,
              MerchantProfile(
                id = s"merchant-profile-${newMerchant.id}",
                ownerName = username,
                phone = "",
                stores = List(MerchantStoreProfile(newMerchant, Nil, Nil, Nil))
              )
            )
            Right(state.copy(accountStore = store.copy(merchantAccounts = store.merchantAccounts :+ acc)))
          case "rider" =>
            val newRider = Rider(
              id = s"r-${System.currentTimeMillis()}",
              name = username,
              phone = "",
              realtimeLocation = "请更新当前位置",
              status = "空闲",
              totalOrders = 0,
              rating = 5,
              station = "未分配站点",
              salary = 0
            )
            val acc = RiderAccount(
              "rider",
              username,
              password,
              RiderProfile(newRider, 0, Nil, Nil)
            )
            Right(
              state.copy(
                riders = state.riders :+ newRider,
                accountStore = store.copy(riderAccounts = store.riderAccounts :+ acc)
              )
            )
          case _ => Left("无效角色")

  private def pushOrderToMerchantStores(accounts: List[MerchantAccount], order: Order): List[MerchantAccount] =
    accounts.map { acc =>
      val newStores = acc.profile.stores.map { sp =>
        if sp.merchant.id == order.merchantId then
          val isHistory = order.status == "已完成" || order.status == "已取消"
          if isHistory then sp.copy(historyOrders = order :: sp.historyOrders)
          else sp.copy(pendingOrders = order :: sp.pendingOrders)
        else sp
      }
      acc.copy(profile = acc.profile.copy(stores = newStores))
    }

  def checkout(
      state: AppState,
      username: String,
      lines: List[CheckoutLine]
  ): Either[String, (AppState, CheckoutResponse)] =
    val store = state.accountStore
    val accountOpt = store.customerAccounts.find(_.username == username)
    accountOpt.toRight("未找到顾客账号").flatMap { account =>
      if lines.isEmpty then Left("购物车为空")
      else
        val grouped = lines.groupBy(_.merchantId)
        val now = java.time.LocalDateTime.now()
        val orderTimeText = f"${now.getYear}%04d-${now.getMonthValue}%02d-${now.getDayOfMonth}%02d ${now.getHour}%02d:${now.getMinute}%02d"

        val createdOrders = grouped.toList.zipWithIndex.flatMap { case ((merchantId, groupLines), idx) =>
          val items = groupLines.flatMap { line =>
            state.catalogProducts.find(p => p.id == line.productId && p.merchantId == merchantId).map { p =>
              OrderItem(p.id, p.name, p.price, line.quantity)
            }
          }
          if items.isEmpty then None
          else
            val totalAmount = items.map(i => i.unitPrice * i.quantity).sum
            val order = Order(
              id = s"o-${System.currentTimeMillis()}-${idx + 1}",
              customerId = account.profile.id,
              merchantId = merchantId,
              riderId = None,
              items = items,
              totalAmount = totalAmount,
              deliveryAddress = account.profile.defaultAddress,
              status = "制作中",
              placedAt = orderTimeText
            )
            Some(order)
        }

        if createdOrders.isEmpty then Left("无法解析购物车商品")
        else
          val total = createdOrders.map(_.totalAmount).sum
          if account.profile.walletBalance < total then Left("余额不足")
          else
            val newWallet = account.profile.walletBalance - total
            val newPending = createdOrders.reverse ::: account.profile.pendingOrders
            val newCustomerAccs = store.customerAccounts.map { ca =>
              if ca.username == username then
                ca.copy(profile = ca.profile.copy(walletBalance = newWallet, pendingOrders = newPending))
              else ca
            }
            val newOrders = createdOrders.reverse ::: state.orders
            val afterAll =
              createdOrders.foldLeft(store.merchantAccounts)((accs, o) => pushOrderToMerchantStores(accs, o))
            val newStore = store.copy(customerAccounts = newCustomerAccs, merchantAccounts = afterAll)
            val ns = state.copy(orders = newOrders, accountStore = newStore)
            Right((ns, CheckoutResponse(createdOrders, newWallet)))
    }

  def patchCustomer(
      state: AppState,
      username: String,
      patch: CustomerProfilePatch
  ): Either[String, AppState] =
    val store = state.accountStore
    store.customerAccounts.find(_.username == username) match
      case None => Left("Not found")
      case Some(acc) =>
        val p = acc.profile
        val np = p.copy(
          walletBalance = patch.walletBalance.getOrElse(p.walletBalance),
          defaultAddress = patch.defaultAddress.getOrElse(p.defaultAddress),
          name = patch.name.getOrElse(p.name),
          phone = patch.phone.getOrElse(p.phone)
        )
        val newAccs = store.customerAccounts.map(ca => if ca.username == username then ca.copy(profile = np) else ca)
        Right(state.copy(accountStore = store.copy(customerAccounts = newAccs)))

  def replaceMerchantProfile(state: AppState, username: String, profile: MerchantProfile): Either[String, AppState] =
    val store = state.accountStore
    store.merchantAccounts.find(_.username == username) match
      case None => Left("Not found")
      case Some(_) =>
        val newAccs =
          store.merchantAccounts.map(ma => if ma.username == username then ma.copy(profile = profile) else ma)
        Right(state.copy(accountStore = store.copy(merchantAccounts = newAccs)))

  def createMerchantStore(state: AppState, username: String, storeName: String, address: String)
      : Either[String, (AppState, String)] =
    val store = state.accountStore
    store.merchantAccounts.find(_.username == username) match
      case None => Left("未找到商家账号")
      case Some(acc) =>
        val m = Merchant(
          id = s"m-local-${System.currentTimeMillis()}",
          storeName = storeName,
          category = "中餐",
          address = address,
          phone = acc.profile.phone,
          rating = 5,
          tags = List("新店"),
          featuredProductIds = Nil
        )
        val sp = MerchantStoreProfile(m, Nil, Nil, Nil)
        val newAcc =
          acc.copy(profile = acc.profile.copy(stores = acc.profile.stores :+ sp))
        val newAccs = store.merchantAccounts.map(ma => if ma.username == username then newAcc else ma)
        Right((state.copy(accountStore = store.copy(merchantAccounts = newAccs)), m.id))

end StoreOps
