package delivery.order.api

import cats.effect.IO
import delivery.order.objects.apiTypes.OrderChatUnreadCountsResponse
import delivery.shared.api.APIWithRoleMessage

import java.sql.Connection

final case class MerchantOrderChatUnreadCountsAPIMessage() extends APIWithRoleMessage[OrderChatUnreadCountsResponse]:
  override def plan(connection: Connection, username: String): IO[OrderChatUnreadCountsResponse] =
    OrderChatUnreadCountsAPIMessageSupport.countsForRole(connection, username, "merchant")
