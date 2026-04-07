package delivery.http.support

import delivery.model.*
import delivery.model.JsonCodecs.given
import io.circe.Json
import io.circe.syntax.*

/** 各服务 /api/auth/me 返回体（需 JsonCodecs.given）。 */
object MeJson:

  def customer(state: UserServiceState, username: String): Either[String, Json] =
    state.customerAccounts.find(_.username == username) match
      case None => Left("未找到账号")
      case Some(acc) =>
        Right(
          Json.obj(
            "username" -> username.asJson,
            "role" -> "customer".asJson,
            "customerAccount" -> CustomerAccountPublic(acc.role, acc.username, acc.profile).asJson
          )
        )

  def merchant(state: MerchantServiceState, username: String): Either[String, Json] =
    state.merchantAccounts.find(_.username == username) match
      case None => Left("未找到账号")
      case Some(acc) =>
        Right(
          Json.obj(
            "username" -> username.asJson,
            "role" -> "merchant".asJson,
            "merchantAccount" -> MerchantAccountPublic(acc.role, acc.username, acc.profile).asJson
          )
        )

  def rider(state: RiderServiceState, username: String): Either[String, Json] =
    state.riderAccounts.find(_.username == username) match
      case None => Left("未找到账号")
      case Some(acc) =>
        Right(
          Json.obj(
            "username" -> username.asJson,
            "role" -> "rider".asJson,
            "riderAccount" -> RiderAccountPublic(acc.role, acc.username, acc.profile).asJson
          )
        )

  def admin(state: AdminServiceState, username: String): Either[String, Json] =
    state.adminAccounts.find(_.username == username) match
      case None => Left("未找到账号")
      case Some(acc) =>
        Right(
          Json.obj(
            "username" -> username.asJson,
            "role" -> "admin".asJson,
            "adminAccount" -> AdminAccountPublic(acc.role, acc.username, acc.displayName).asJson
          )
        )

end MeJson
