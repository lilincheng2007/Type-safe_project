package delivery.admin.api

import cats.effect.IO
import delivery.admin.objects.apiTypes.{AdminOrderMonitorItem, AdminOrderMonitorResponse}
import delivery.order.objects.Order
import delivery.order.tables.order.OrderTable
import delivery.rider.tables.riderassignment.RiderAssignmentTable
import delivery.rider.utils.RiderTimeoutPolicy
import delivery.shared.api.APIWithRoleMessage
import delivery.shared.objects.{OrderId, OrderStatus, RefundStatus}

import java.sql.Connection
import java.time.{Instant, LocalDate, LocalDateTime, ZoneId}
import java.time.format.DateTimeFormatter
import scala.util.Try

final case class AdminOrderMonitorAPIMessage() extends APIWithRoleMessage[AdminOrderMonitorResponse]:
  override def plan(connection: Connection, username: String): IO[AdminOrderMonitorResponse] =
    for
      orders <- OrderTable.list(connection)
      assignments <- RiderAssignmentTable.listAll(connection)
      now <- IO.realTime.map(duration => Instant.ofEpochMilli(duration.toMillis))
      zoneId <- IO.delay(ZoneId.systemDefault())
    yield
      val today = LocalDate.now(zoneId)
      val todayOrders = orders.filter(order => placedDate(order.placedAt, zoneId).contains(today))
      val todayTurnover = roundMoney(todayOrders.filterNot(order => Set(OrderStatus.已取消, OrderStatus.已退款).contains(order.status)).map(_.payableAmount).sum)
      val ordersById = orders.map(order => order.id -> order).toMap
      val pendingRefunds = orders
        .filter(order => order.refundStatus.exists(status => Set(RefundStatus.待审核, RefundStatus.待商家审核, RefundStatus.待管理员仲裁).contains(status)))
        .map(order => item(order, refundReason(order), elapsedMinutes(order.refundRequestedAt.getOrElse(order.placedAt), now, zoneId)))
      val abnormalOrders = orders
        .filter(isAbnormal)
        .map(order => item(order, abnormalReason(order), elapsedMinutes(order.placedAt, now, zoneId)))
      val merchantTimeoutOrders = orders
        .filter(isMerchantTimeout(_, now, zoneId))
        .map(order => item(order, merchantTimeoutReason(order), elapsedMinutes(order.placedAt, now, zoneId)))
      val riderTimeoutOrders = assignments.flatMap { assignment =>
        val activeTimeout = assignment.completedAt.isEmpty && now.isAfter(assignment.deadlineAt.getOrElse(RiderTimeoutPolicy.deadlineAt(assignment.assignedAt)))
        val finishedTimeout = assignment.wasTimeout && !assignment.timeoutExempted
        Option.when(activeTimeout || finishedTimeout) {
          ordersById.get(assignment.orderId).map { order =>
            val deadline = assignment.deadlineAt.getOrElse(RiderTimeoutPolicy.deadlineAt(assignment.assignedAt))
            val overtimeMinutes = math.max(1, ((assignment.completedAt.getOrElse(now).getEpochSecond - deadline.getEpochSecond) / 60).toInt)
            item(order, if activeTimeout then "骑手配送已超过预计送达时间" else "骑手历史配送超时", overtimeMinutes)
          }
        }.flatten
      }
      AdminOrderMonitorResponse(
        todayOrderCount = todayOrders.size,
        todayTurnover = todayTurnover,
        pendingRefunds = pendingRefunds,
        abnormalOrders = abnormalOrders,
        merchantTimeoutOrders = merchantTimeoutOrders,
        riderTimeoutOrders = riderTimeoutOrders
      )

  private val PlacedAtFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
  private val MerchantAcceptTimeoutMinutes = 10
  private val MerchantReadyTimeoutMinutes = 30

  private def item(order: Order, reason: String, elapsedMinutes: Int): AdminOrderMonitorItem =
    AdminOrderMonitorItem(order, reason, math.max(0, elapsedMinutes))

  private def placedDate(value: String, zoneId: ZoneId): Option[LocalDate] =
    parseLocalDateTime(value).map(_.toLocalDate).orElse(parseInstant(value).map(_.atZone(zoneId).toLocalDate))

  private def elapsedMinutes(value: String, now: Instant, zoneId: ZoneId): Int =
    val startedAt = parseInstant(value).orElse(parseLocalDateTime(value).map(_.atZone(zoneId).toInstant))
    startedAt.map(instant => math.max(0, ((now.getEpochSecond - instant.getEpochSecond) / 60).toInt)).getOrElse(0)

  private def parseLocalDateTime(value: String): Option[LocalDateTime] =
    Try(LocalDateTime.parse(value, PlacedAtFormatter)).toOption

  private def parseInstant(value: String): Option[Instant] =
    Try(Instant.parse(value)).toOption

  private def isMerchantTimeout(order: Order, now: Instant, zoneId: ZoneId): Boolean =
    val elapsed = elapsedMinutes(order.placedAt, now, zoneId)
    (order.status == OrderStatus.待商家接单 && elapsed >= MerchantAcceptTimeoutMinutes) ||
      (order.status == OrderStatus.制作中 && elapsed >= MerchantReadyTimeoutMinutes)

  private def merchantTimeoutReason(order: Order): String =
    if order.status == OrderStatus.待商家接单 then s"商家超过${MerchantAcceptTimeoutMinutes}分钟未接单"
    else s"商家超过${MerchantReadyTimeoutMinutes}分钟未出餐"

  private def isAbnormal(order: Order): Boolean =
    Set(OrderStatus.已取消, OrderStatus.已退款).contains(order.status) ||
      order.refundStatus.exists(status => Set(RefundStatus.商家已驳回, RefundStatus.已驳回).contains(status))

  private def abnormalReason(order: Order): String =
    order.refundStatus match
      case Some(RefundStatus.商家已驳回) => "商家驳回退款，可能需要关注"
      case Some(RefundStatus.已驳回) => "退款仲裁已驳回"
      case _ if order.status == OrderStatus.已退款 => "订单已退款"
      case _ if order.status == OrderStatus.已取消 => "订单已取消"
      case _ => "订单状态异常"

  private def refundReason(order: Order): String =
    order.refundStatus match
      case Some(RefundStatus.待管理员仲裁) => "退款待管理员仲裁"
      case Some(RefundStatus.待商家审核) | Some(RefundStatus.待审核) => "退款待商家处理"
      case _ => "退款待处理"

  private def roundMoney(value: Double): Double =
    BigDecimal(value).setScale(2, BigDecimal.RoundingMode.HALF_UP).toDouble
