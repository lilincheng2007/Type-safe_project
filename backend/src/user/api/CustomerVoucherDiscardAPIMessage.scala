package delivery.user.api

import cats.effect.IO
import delivery.shared.api.{APIWithRoleMessage, HttpApiError}
import delivery.shared.objects.{VoucherId}
import delivery.shared.objects.apiTypes.{OkResponse}
import delivery.user.tables.customerprofile.CustomerProfileTable
import delivery.user.utils.UserApiSupport

import java.sql.Connection

final case class CustomerVoucherDiscardAPIMessage(voucherId: VoucherId) extends APIWithRoleMessage[OkResponse]:
  override def plan(connection: Connection, username: String): IO[OkResponse] =
    for
      account <- CustomerProfileTable.findByUsername(connection, username).flatMap {
        case Some(value) => IO.pure(value)
        case None        => IO.raiseError(HttpApiError.NotFound(UserApiSupport.customerNotFound.error))
      }
      nextAccount <- UserAPIMessageSupport.discardExpiredVoucher(account, voucherId) match
        case Left(msg) => IO.raiseError(HttpApiError.BadRequest(msg))
        case Right(value) => IO.pure(value)
      _ <- CustomerProfileTable.upsert(connection, nextAccount)
    yield OkResponse(ok = true)
