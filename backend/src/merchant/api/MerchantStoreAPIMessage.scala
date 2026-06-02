package delivery.merchant.api

import cats.effect.IO
import delivery.merchant.objects.Merchant
import delivery.merchant.tables.merchantaccount.MerchantAccountTable
import delivery.merchant.tables.merchantstore.MerchantStoreTable
import delivery.shared.api.{APIWithRoleMessage, HttpApiError}
import delivery.shared.objects.MerchantCategory

import java.sql.Connection

final case class MerchantStoreAPIMessage(storeName: String, address: String) extends APIWithRoleMessage[String]:
  override def plan(connection: Connection, username: String): IO[String] =
    if storeName.trim.isEmpty || address.trim.isEmpty then IO.raiseError(HttpApiError.BadRequest("店铺名称和地址不能为空"))
    else
      for
        account <- MerchantAccountTable.findByUsername(connection, username)
        _ <- IO.fromOption(account)(HttpApiError.BadRequest("未找到商家账号"))
        nowMillis <- IO.realTime.map(_.toMillis)
        merchant = Merchant(s"m-local-$nowMillis", storeName.trim, MerchantCategory.中餐, address.trim, account.map(_.profile.phone).getOrElse(""), 5, List("新店"), Nil, None, "")
        _ <- MerchantStoreTable.upsert(connection, username, merchant)
      yield merchant.id
