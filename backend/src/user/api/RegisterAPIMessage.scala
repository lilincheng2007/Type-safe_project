package delivery.user.api

import cats.effect.IO
import delivery.shared.api.{APIMessage, HttpApiError}
import delivery.shared.objects.{UserRole}
import delivery.shared.objects.apiTypes.{OkResponse}
import delivery.user.tables.AuthCredentialRecord
import delivery.user.tables.authcredential.AuthCredentialTable

import java.sql.Connection

final case class RegisterAPIMessage(role: UserRole, username: String, password: String) extends APIMessage[OkResponse]:
  override def plan(connection: Connection): IO[OkResponse] =
    val roleValue = role.toString
    for
      existing <- AuthCredentialTable.find(connection, roleValue, username)
      _ <- existing match
        case Some(_) => IO.raiseError(HttpApiError.BadRequest("该角色下账号已存在。"))
        case None    => IO.unit
      _ <- AuthCredentialTable.upsert(connection, AuthCredentialRecord(roleValue, username, password))
      _ <- role match
        case UserRole.customer => UserAPIMessageSupport.registerCustomer(connection, username, password)
        case UserRole.merchant => UserAPIMessageSupport.registerMerchant(connection, username, password)
        case UserRole.rider    => UserAPIMessageSupport.registerRider(connection, username, password)
        case UserRole.admin    => IO.unit
    yield OkResponse(ok = true)
