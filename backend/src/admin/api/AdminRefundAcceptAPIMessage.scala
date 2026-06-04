package delivery.admin.api

import cats.effect.IO
import delivery.order.api.OrderAPIMessageSupport
import delivery.order.tables.order.OrderTable
import delivery.shared.api.{APIWithRoleMessage, HttpApiError}
import delivery.shared.objects.{OrderId, OrderStatus, RefundStatus}
import delivery.shared.objects.apiTypes.OkResponse
import delivery.user.tables.customerprofile.CustomerProfileTable

import java.sql.Connection

final case class AdminRefundAcceptAPIMessage(orderId: OrderId, reason: Option[String]) extends APIWithRoleMessage[OkResponse]:
  override def plan(connection: Connection, username: String): IO[OkResponse] =
    val adminReason = reason.map(_.trim).filter(_.nonEmpty)
    for
      order <- OrderTable.findById(connection, orderId).flatMap {
        case Some(value) => IO.pure(value)
        case None        => IO.raiseError(HttpApiError.BadRequest("未找到订单"))
      }
      _ <-
        if !order.refundStatus.contains(RefundStatus.待审核) then IO.raiseError(HttpApiError.BadRequest("该订单没有待审核退款申请"))
        else IO.unit
      account <- CustomerProfileTable.findById(connection, order.customerId).flatMap {
        case Some(value) => IO.pure(value)
        case None        => IO.raiseError(HttpApiError.BadRequest("未找到顾客账号"))
      }
      now <- IO.realTimeInstant.map(_.toString)
      refundAmount = if order.payableAmount > 0 then order.payableAmount else order.totalAmount
      refundedOrder = order.copy(
        status = OrderStatus.已退款,
        refundStatus = Some(RefundStatus.已通过),
        refundAdminReason = adminReason,
        refundedAt = Some(now)
      )
      nextPoints = math.max(0, account.profile.foodiePoints - order.pointsAwarded)
      nextProfile = account.profile.copy(
        walletBalance = OrderAPIMessageSupport.roundMoney(account.profile.walletBalance + refundAmount),
        foodiePoints = nextPoints,
        foodieLevel = OrderAPIMessageSupport.levelOf(nextPoints),
        historyOrders = refundedOrder :: account.profile.historyOrders.filterNot(_.id == order.id),
        pendingOrders = account.profile.pendingOrders.filterNot(_.id == order.id)
      )
      _ <- OrderTable.upsert(connection, refundedOrder)
      _ <- CustomerProfileTable.upsert(connection, account.copy(profile = nextProfile))
    yield OkResponse(ok = true)
