package delivery.user.api

import cats.effect.IO
import delivery.shared.api.{APIWithRoleMessage, HttpApiError}
import delivery.user.objects.apiTypes.CustomerMeResponse
import delivery.user.tables.customerprofile.CustomerProfileTable
import delivery.user.utils.UserApiSupport

import java.sql.Connection

final case class CustomerMeAPIMessage() extends APIWithRoleMessage[CustomerMeResponse]:
  override def plan(connection: Connection, username: String): IO[CustomerMeResponse] =
    for
      response <- CustomerProfileTable.findByUsername(connection, username)
      output <- response.map(account => UserApiSupport.customerMeResponse(username, account)) match
        case None => IO.raiseError(HttpApiError.NotFound(UserApiSupport.customerNotFound.error))
        case Some(value) => IO.pure(value)
    yield output
