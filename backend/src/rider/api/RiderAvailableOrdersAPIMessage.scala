package delivery.rider.api

import cats.effect.IO
import delivery.order.tables.order.OrderTable
import delivery.rider.objects.apiTypes.RiderAvailableOrdersResponse
import delivery.rider.tables.rideraccount.RiderAccountTable
import delivery.rider.validators.RiderAccountValidator
import delivery.platform.api.{APIWithRoleMessage, HttpApiError}

import java.sql.Connection

final case class RiderAvailableOrdersAPIMessage() extends APIWithRoleMessage[RiderAvailableOrdersResponse]:
  override def plan(connection: Connection, username: String): IO[RiderAvailableOrdersResponse] =
    RiderAccountTable.findByUsername(connection, username).flatMap {
      case None => IO.raiseError(HttpApiError.NotFound(RiderAccountValidator.AccountNotFoundMessage))
      case Some(_) =>
        OrderTable.listAvailableUnassigned(connection).map(RiderAvailableOrdersResponse(_))
    }
