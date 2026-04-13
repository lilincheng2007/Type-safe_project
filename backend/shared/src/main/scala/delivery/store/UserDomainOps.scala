package delivery.store

import cats.effect.IO
import delivery.model.*

object UserDomainOps:

  def verifyLogin(state: UserServiceState, role: String, username: String, password: String)
      : Either[String, Unit] =
    state.authCredentials.find(c => c.role == role && c.username == username).map(_.password) match
      case None                     => Left(s"未找到该角色下的账号：$username")
      case Some(p) if p != password => Left("密码错误，请重新输入。")
      case Some(_)                  => Right(())

  def registerCustomer(state: UserServiceState, username: String, password: String)
      : IO[Either[String, UserServiceState]] =
    if state.authCredentials.exists(c => c.role == "customer" && c.username == username) then
      IO.pure(Left("该角色下账号已存在。"))
    else
      IO.realTime.map(_.toMillis).map { nowMillis =>
        val newCustomer = Customer(
          id = s"u-$nowMillis",
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
        val cred = AuthCredential("customer", username, password)
        Right(
          state.copy(
            customers = state.customers :+ newCustomer,
            customerAccounts = state.customerAccounts :+ acc,
            authCredentials = state.authCredentials :+ cred
          )
        )
      }

  def registerMerchantCredential(state: UserServiceState, username: String, password: String)
      : Either[String, UserServiceState] =
    if state.authCredentials.exists(c => c.role == "merchant" && c.username == username) then
      Left("该角色下账号已存在。")
    else
      val cred = AuthCredential("merchant", username, password)
      Right(state.copy(authCredentials = state.authCredentials :+ cred))

  def registerRiderCredential(state: UserServiceState, username: String, password: String)
      : Either[String, UserServiceState] =
    if state.authCredentials.exists(c => c.role == "rider" && c.username == username) then
      Left("该角色下账号已存在。")
    else
      val cred = AuthCredential("rider", username, password)
      Right(state.copy(authCredentials = state.authCredentials :+ cred))

  def patchCustomer(state: UserServiceState, username: String, patch: CustomerProfilePatch)
      : Either[String, UserServiceState] =
    state.customerAccounts.find(_.username == username) match
      case None => Left("Not found")
      case Some(acc) =>
        val p = acc.profile
        val np = p.copy(
          walletBalance = patch.walletBalance.getOrElse(p.walletBalance),
          defaultAddress = patch.defaultAddress.getOrElse(p.defaultAddress),
          name = patch.name.getOrElse(p.name),
          phone = patch.phone.getOrElse(p.phone)
        )
        val newAccs =
          state.customerAccounts.map(ca => if ca.username == username then ca.copy(profile = np) else ca)
        Right(state.copy(customerAccounts = newAccs))

  /** 下单成功后扣款并写入顾客待配送订单。 */
  def checkoutComplete(state: UserServiceState, req: CheckoutCompleteRequest): Either[String, UserServiceState] =
    state.customerAccounts.find(_.username == req.username).toRight("未找到顾客账号").flatMap { account =>
      if account.profile.walletBalance < req.totalDebit then Left("余额不足")
      else
        val newWallet = account.profile.walletBalance - req.totalDebit
        val newPending = req.orders.reverse ::: account.profile.pendingOrders
        val newAccs = state.customerAccounts.map { ca =>
          if ca.username == req.username then
            ca.copy(profile = ca.profile.copy(walletBalance = newWallet, pendingOrders = newPending))
          else ca
        }
        Right(state.copy(customerAccounts = newAccs))
    }

end UserDomainOps
