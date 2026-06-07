package delivery.order.api

import cats.effect.IO
import cats.syntax.all.*
import delivery.order.objects.{Order, OrderChatMessage, OrderTimelineEvent}
import delivery.order.tables.order.OrderTable
import delivery.order.tables.orderchat.OrderChatMessageTable
import delivery.shared.api.HttpApiError
import delivery.shared.objects.OrderStatus

import java.sql.Connection
import java.time.Instant
import java.util.UUID

object OrderStatusTransitionService:
  def transition(
      connection: Connection,
      order: Order,
      targetStatus: OrderStatus,
      actorRole: String,
      patch: Order => Order = identity
  ): IO[Order] =
    for
      _ <- validate(order.status, targetStatus, actorRole)
      now <- IO.realTime.map(duration => Instant.ofEpochMilli(duration.toMillis).toString)
      updated = appendTransitionEvents(patch(order.copy(status = targetStatus)), order.status, targetStatus, actorRole, now)
      _ <- OrderTable.upsert(connection, updated)
      _ <- emitTransitionMessages(connection, order, updated, actorRole)
    yield updated

  def canTransition(from: OrderStatus, to: OrderStatus, actorRole: String): Boolean =
    allowedTransitions.get((from, to)).exists(_.contains(actorRole))

  private val allowedTransitions: Map[(OrderStatus, OrderStatus), Set[String]] = Map(
    (OrderStatus.待商家接单, OrderStatus.制作中) -> Set("merchant"),
    (OrderStatus.待商家接单, OrderStatus.已取消) -> Set("customer", "merchant"),
    (OrderStatus.制作中, OrderStatus.待骑手接单) -> Set("merchant"),
    (OrderStatus.待骑手接单, OrderStatus.配送中) -> Set("rider"),
    (OrderStatus.配送中, OrderStatus.已送达) -> Set("rider"),
    (OrderStatus.已送达, OrderStatus.已完成) -> Set("customer"),
    (OrderStatus.已完成, OrderStatus.已退款) -> Set("merchant", "admin")
  )

  private def validate(from: OrderStatus, to: OrderStatus, actorRole: String): IO[Unit] =
    if canTransition(from, to, actorRole) then IO.unit
    else IO.raiseError(HttpApiError.BadRequest(s"当前状态不可由${actorLabel(actorRole)}从${from}变更为${to}"))

  private def appendTransitionEvents(order: Order, previousStatus: OrderStatus, targetStatus: OrderStatus, actorRole: String, occurredAt: String): Order =
    val events = transitionEvents(previousStatus, targetStatus, actorRole, occurredAt)
    if events.isEmpty then order
    else
      val existingKeys = order.statusTimeline.map(_.key).toSet
      order.copy(statusTimeline = order.statusTimeline ++ events.filterNot(event => existingKeys.contains(event.key)))

  private def transitionEvents(previousStatus: OrderStatus, targetStatus: OrderStatus, actorRole: String, occurredAt: String): List[OrderTimelineEvent] =
    (previousStatus, targetStatus, actorRole) match
      case (OrderStatus.待商家接单, OrderStatus.制作中, "merchant") =>
        List(OrderTimelineEvent("merchantAccepted", "商家已接单", occurredAt, Some("商家已确认订单，开始备餐")))
      case (OrderStatus.制作中, OrderStatus.待骑手接单, "merchant") =>
        List(OrderTimelineEvent("merchantReady", "商家出餐", occurredAt, Some("餐品已制作完成，等待骑手接单")))
      case (OrderStatus.待骑手接单, OrderStatus.配送中, "rider") =>
        List(
          OrderTimelineEvent("riderAccepted", "骑手已接单", occurredAt, Some("骑手已接单，准备前往商家取餐")),
          OrderTimelineEvent("riderPickedUp", "骑手取餐", occurredAt, Some("骑手已取餐，正在配送途中")),
          OrderTimelineEvent("delivering", "配送中", occurredAt, Some("餐品正在配送途中"))
        )
      case (OrderStatus.配送中, OrderStatus.已送达, "rider") =>
        List(OrderTimelineEvent("delivered", "已送达", occurredAt, Some("餐品已送达，请及时查收")))
      case (OrderStatus.已送达, OrderStatus.已完成, "customer") =>
        List(OrderTimelineEvent("completed", "已完成/可评价", occurredAt, Some("订单已完成，可以评价本次体验")))
      case (OrderStatus.待商家接单, OrderStatus.已取消, _) =>
        List(OrderTimelineEvent("canceled", "已取消", occurredAt, Some("订单已取消")))
      case (OrderStatus.已完成, OrderStatus.已退款, _) =>
        List(OrderTimelineEvent("refunded", "已退款", occurredAt, Some("订单已退款")))
      case _ => Nil

  private def emitTransitionMessages(connection: Connection, previous: Order, updated: Order, actorRole: String): IO[Unit] =
    (previous.status, updated.status, actorRole) match
      case (OrderStatus.待商家接单, OrderStatus.制作中, "merchant") =>
        createSystemChatMessage(
          connection,
          updated,
          senderRole = "merchant",
          peerRole = "customer",
          content = OrderChatNotificationTemplates.merchantOrderAccepted(updated)
        )
      case (OrderStatus.制作中, OrderStatus.待骑手接单, "merchant") =>
        createSystemChatMessage(
          connection,
          updated,
          senderRole = "merchant",
          peerRole = "customer",
          content = OrderChatNotificationTemplates.merchantOrderReady(updated)
        )
      case (OrderStatus.配送中, OrderStatus.已送达, "rider") =>
        createSystemChatMessage(
          connection,
          updated,
          senderRole = "rider",
          peerRole = "customer",
          content = OrderChatNotificationTemplates.riderOrderDelivered(updated)
        )
      case _ => IO.unit

  private def createSystemChatMessage(
      connection: Connection,
      order: Order,
      senderRole: String,
      peerRole: String,
      content: String
  ): IO[Unit] =
    OrderChatMessageTable.create(
      connection,
      OrderChatMessage(
        id = UUID.randomUUID().toString,
        orderId = order.id,
        senderRole = senderRole,
        peerRole = peerRole,
        messageType = "text",
        content = content,
        createdAt = Instant.now().toString
      )
    ).void

  private def actorLabel(actorRole: String): String =
    actorRole match
      case "customer" => "顾客"
      case "merchant" => "商家"
      case "rider"    => "骑手"
      case "admin"    => "管理员"
      case other       => other

end OrderStatusTransitionService
