package delivery.store

import cats.effect.IO
import delivery.model.*

object MerchantDomainOps:

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

  def attachOrders(state: MerchantServiceState, orders: List[Order]): MerchantServiceState =
    val next =
      orders.foldLeft(state.merchantAccounts)((accs, o) => pushOrderToMerchantStores(accs, o))
    state.copy(merchantAccounts = next)

  def replaceMerchantProfile(
      state: MerchantServiceState,
      username: String,
      profile: MerchantProfile
  ): Either[String, MerchantServiceState] =
    state.merchantAccounts.find(_.username == username) match
      case None => Left("Not found")
      case Some(_) =>
        val newAccs =
          state.merchantAccounts.map(ma => if ma.username == username then ma.copy(profile = profile) else ma)
        Right(state.copy(merchantAccounts = newAccs))

  def createMerchantStore(state: MerchantServiceState, username: String, storeName: String, address: String)
      : IO[Either[String, (MerchantServiceState, String)]] =
    state.merchantAccounts.find(_.username == username) match
      case None => IO.pure(Left("未找到商家账号"))
      case Some(acc) =>
        IO.realTime.map(_.toMillis).map { nowMillis =>
          val m = Merchant(
            id = s"m-local-$nowMillis",
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
          val newAccs = state.merchantAccounts.map(ma => if ma.username == username then newAcc else ma)
          val catalogM = state.catalogMerchants :+ m
          Right((state.copy(merchantAccounts = newAccs, catalogMerchants = catalogM), m.id))
        }

  /** 用户服务注册商户后，在本库创建默认店铺档案（无密码）。 */
  def bootstrapMerchant(state: MerchantServiceState, username: String): IO[Either[String, MerchantServiceState]] =
    if state.merchantAccounts.exists(_.username == username) then IO.pure(Left("商户已存在"))
    else
      IO.realTime.map(_.toMillis).map { nowMillis =>
        val newMerchant = Merchant(
          id = s"m-$nowMillis",
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
          "", // 凭证在用户库
          MerchantProfile(
            id = s"merchant-profile-${newMerchant.id}",
            ownerName = username,
            phone = "",
            stores = List(MerchantStoreProfile(newMerchant, Nil, Nil, Nil))
          )
        )
        Right(
          state.copy(
            merchantAccounts = state.merchantAccounts :+ acc,
            catalogMerchants = state.catalogMerchants :+ newMerchant
          )
        )
      }

end MerchantDomainOps
