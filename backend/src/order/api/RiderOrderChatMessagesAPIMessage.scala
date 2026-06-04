package delivery.order.api

import cats.effect.IO
import delivery.order.objects.apiTypes.OrderChatMessagesResponse
import delivery.order.tables.orderchat.OrderChatMessageTable
import delivery.shared.api.APIWithRoleMessage
import delivery.shared.objects.OrderId

import java.sql.Connection

final case class RiderOrderChatMessagesAPIMessage(orderId: OrderId, peerRole: String) extends APIWithRoleMessage[OrderChatMessagesResponse]:
  override def plan(connection: Connection, username: String): IO[OrderChatMessagesResponse] =
    for
      _ <- OrderChatAPIMessageSupport.requireOrderForRole(connection, username, "rider", orderId, peerRole)
      _ <- OrderChatMessageTable.markReadForPair(connection, orderId, "rider", peerRole)
      messages <- OrderChatMessageTable.listForPair(connection, orderId, "rider", peerRole)
    yield OrderChatMessagesResponse(messages)
