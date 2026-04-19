package delivery.merchant.state

import cats.effect.IO
import delivery.merchant.objects.*
import delivery.order.objects.Order

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
    state.copy(merchantAccounts = orders.foldLeft(state.merchantAccounts)((accs, o) => pushOrderToMerchantStores(accs, o)))

  def replaceMerchantProfile(state: MerchantServiceState, username: String, profile: MerchantProfile): Either[String, MerchantServiceState] =
    state.merchantAccounts.find(_.username == username) match
      case None => Left("Not found")
      case Some(_) =>
        Right(state.copy(merchantAccounts = state.merchantAccounts.map(ma => if ma.username == username then ma.copy(profile = profile) else ma)))

  def createMerchantStore(state: MerchantServiceState, username: String, storeName: String, address: String): IO[Either[String, (MerchantServiceState, String)]] =
    state.merchantAccounts.find(_.username == username) match
      case None => IO.pure(Left("未找到商家账号"))
      case Some(acc) =>
        IO.realTime.map(_.toMillis).map { nowMillis =>
          val m = Merchant(s"m-local-$nowMillis", storeName, "中餐", address, acc.profile.phone, 5, List("新店"), Nil)
          val sp = MerchantStoreProfile(m, Nil, Nil, Nil)
          val newAcc = acc.copy(profile = acc.profile.copy(stores = acc.profile.stores :+ sp))
          Right((state.copy(merchantAccounts = state.merchantAccounts.map(ma => if ma.username == username then newAcc else ma), catalogMerchants = state.catalogMerchants :+ m), m.id))
        }

  def bootstrapMerchant(state: MerchantServiceState, username: String): IO[Either[String, MerchantServiceState]] =
    if state.merchantAccounts.exists(_.username == username) then IO.pure(Left("商户已存在"))
    else
      IO.realTime.map(_.toMillis).map { nowMillis =>
        val newMerchant = Merchant(s"m-$nowMillis", s"${username}的店铺", "中餐", "请完善店铺地址", "", 5, Nil, Nil)
        val acc = MerchantAccount("merchant", username, "", MerchantProfile(s"merchant-profile-${newMerchant.id}", username, "", List(MerchantStoreProfile(newMerchant, Nil, Nil, Nil))))
        Right(state.copy(merchantAccounts = state.merchantAccounts :+ acc, catalogMerchants = state.catalogMerchants :+ newMerchant))
      }

end MerchantDomainOps
