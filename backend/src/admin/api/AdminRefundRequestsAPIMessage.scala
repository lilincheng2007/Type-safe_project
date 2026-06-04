package delivery.admin.api

import cats.effect.IO
import delivery.admin.objects.apiTypes.AdminRefundRequestsResponse
import delivery.order.tables.order.OrderTable
import delivery.shared.api.APIWithRoleMessage

import java.sql.Connection

final case class AdminRefundRequestsAPIMessage() extends APIWithRoleMessage[AdminRefundRequestsResponse]:
  override def plan(connection: Connection, username: String): IO[AdminRefundRequestsResponse] =
    OrderTable.listRefundRequests(connection).map(AdminRefundRequestsResponse.apply)
