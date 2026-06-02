package delivery.rider.api

import cats.effect.IO
import delivery.order.tables.order.OrderTable
import delivery.rider.objects.apiTypes.RiderMeResponse
import delivery.rider.tables.rideraccount.RiderAccountTable
import delivery.rider.tables.riderassignment.RiderAssignmentTable
import delivery.rider.utils.RiderApiSupport
import delivery.shared.api.{APIWithRoleMessage, HttpApiError}

import java.sql.Connection

final case class RiderMeAPIMessage() extends APIWithRoleMessage[RiderMeResponse]:
  override def plan(connection: Connection, username: String): IO[RiderMeResponse] =
    for
      account <- RiderAccountTable.findByUsername(connection, username)
      response <- account match
        case None => IO.pure(None)
        case Some(value) =>
          for
            assignedOrders <- OrderTable.listByRiderId(connection, value.profile.rider.id)
            availableOrders <- OrderTable.listAvailableUnassigned(connection)
            records <- RiderAssignmentTable.listByRider(connection, value.profile.rider.id)
          yield
            val nextAccount = value.copy(profile =
              value.profile.copy(
                pendingOrders = assignedOrders.filterNot(order => RiderAPIMessageSupport.isHistoryOrderStatus(order.status)),
                historyOrders = assignedOrders.filter(order => RiderAPIMessageSupport.isHistoryOrderStatus(order.status))
              )
            )
            val deliveryStatuses = records.map(record => RiderAPIMessageSupport.statusView(record, nextAccount.profile.rider.timeoutCardCount > 0))
            Some(RiderApiSupport.riderMeResponse(username, nextAccount, availableOrders, deliveryStatuses))
      output <- response match
        case None => IO.raiseError(HttpApiError.NotFound(RiderApiSupport.riderNotFound.error))
        case Some(value) => IO.pure(value)
    yield output
