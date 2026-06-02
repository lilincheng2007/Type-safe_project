package delivery.order.api

import cats.effect.IO
import delivery.order.objects.apiTypes.CustomerOrdersResponse
import delivery.order.tables.order.OrderTable
import delivery.order.utils.OrderApiSupport
import delivery.shared.api.{APIWithRoleMessage, HttpApiError}
import delivery.user.tables.customerprofile.CustomerProfileTable

import java.sql.Connection

final case class CustomerOrdersAPIMessage() extends APIWithRoleMessage[CustomerOrdersResponse]:
  override def plan(connection: Connection, username: String): IO[CustomerOrdersResponse] =
    for
      account <- CustomerProfileTable.findByUsername(connection, username)
      output <- account match
        case None => IO.raiseError(HttpApiError.NotFound(OrderApiSupport.customerNotFound.error))
        case Some(value) =>
          OrderTable.listByCustomerId(connection, value.profile.id).map { customerOrders =>
            CustomerOrdersResponse(
              pendingOrders = customerOrders.filterNot(order => OrderAPIMessageSupport.isHistoryOrderStatus(order.status)),
              historyOrders = customerOrders.filter(order => OrderAPIMessageSupport.isHistoryOrderStatus(order.status))
            )
          }
    yield output
