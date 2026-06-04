package delivery.order.api

import cats.effect.IO
import delivery.order.objects.OrderChatMessage
import delivery.order.objects.apiTypes.OrderChatMessagesResponse
import delivery.order.tables.orderchat.OrderChatMessageTable
import delivery.shared.api.APIWithRoleMessage
import delivery.shared.objects.OrderId

import java.sql.Connection
import java.time.Instant
import java.util.UUID

final case class CustomerSendOrderChatMessageAPIMessage(orderId: OrderId, peerRole: String, messageType: String, content: String) extends APIWithRoleMessage[OrderChatMessagesResponse]:
  override def plan(connection: Connection, username: String): IO[OrderChatMessagesResponse] =
    for
      _ <- OrderChatAPIMessageSupport.requireOrderForRole(connection, username, "customer", orderId, peerRole)
      _ <- OrderChatAPIMessageSupport.validateMessage(messageType, content)
      _ <- OrderChatMessageTable.create(connection, OrderChatMessage(UUID.randomUUID().toString, orderId, "customer", peerRole, messageType, content.trim, Instant.now().toString))
      messages <- OrderChatMessageTable.listForPair(connection, orderId, "customer", peerRole)
    yield OrderChatMessagesResponse(messages)
