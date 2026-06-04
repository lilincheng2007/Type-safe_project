package delivery.order.api

import cats.effect.IO
import delivery.order.objects.apiTypes.OrderChatMessagesResponse
import delivery.order.tables.orderchat.OrderChatMessageTable
import delivery.shared.api.APIWithRoleMessage
import delivery.shared.objects.OrderId

import java.sql.Connection

final case class CustomerOrderChatMessagesAPIMessage(orderId: OrderId, peerRole: String) extends APIWithRoleMessage[OrderChatMessagesResponse]:
  override def plan(connection: Connection, username: String): IO[OrderChatMessagesResponse] =
    for
      _ <- OrderChatAPIMessageSupport.requireOrderForRole(connection, username, "customer", orderId, peerRole)
      _ <- OrderChatMessageTable.markReadForPair(connection, orderId, "customer", peerRole)
      messages <- OrderChatMessageTable.listForPair(connection, orderId, "customer", peerRole)
    yield OrderChatMessagesResponse(messages)
