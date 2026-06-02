package delivery.rider.api

import cats.effect.IO
import delivery.order.tables.order.OrderTable
import delivery.rider.objects.RiderDeliverySettlement
import delivery.rider.tables.rideraccount.RiderAccountTable
import delivery.rider.tables.riderassignment.RiderAssignmentTable
import delivery.rider.utils.RiderTimeoutPolicy
import delivery.shared.api.{APIWithRoleMessage, HttpApiError}
import delivery.shared.objects.{OrderId, OrderStatus, RiderStatus}

import java.sql.Connection
import java.time.Instant

final case class RiderUpdateOrderStatusAPIMessage(orderId: OrderId, targetStatus: OrderStatus) extends APIWithRoleMessage[RiderDeliverySettlement]:
  override def plan(connection: Connection, username: String): IO[RiderDeliverySettlement] =
    for
      account <- RiderAccountTable.findByUsername(connection, username).flatMap {
        case Some(value) => IO.pure(value)
        case None        => IO.raiseError(HttpApiError.BadRequest("未找到骑手账号"))
      }
      order <- OrderTable.findById(connection, orderId).flatMap {
        case Some(value) => IO.pure(value)
        case None        => IO.raiseError(HttpApiError.BadRequest("未找到订单"))
      }
      _ <-
        if order.riderId != Some(account.profile.rider.id) then IO.raiseError(HttpApiError.BadRequest("无权操作该订单"))
        else if order.status != OrderStatus.配送中 then IO.raiseError(HttpApiError.BadRequest(s"当前状态不可执行更新状态：${order.status}"))
        else if targetStatus != OrderStatus.已送达 then IO.raiseError(HttpApiError.BadRequest("骑手只能将配送中订单更新为已送达"))
        else IO.unit
      assignment <- RiderAssignmentTable.find(connection, account.profile.rider.id, orderId).flatMap {
        case Some(value) => IO.pure(value)
        case None        => IO.raiseError(HttpApiError.BadRequest("未找到骑手派单记录"))
      }
      completedAt = Instant.now()
      deadlineAt = RiderTimeoutPolicy.deadlineAt(assignment.assignedAt)
      overtimeSeconds = RiderTimeoutPolicy.overtimeSeconds(assignment.assignedAt, completedAt)
      wasTimeout = overtimeSeconds > 0
      earnedEnergy = if wasTimeout then 0 else RiderTimeoutPolicy.EnergyPerDeliveredOrder
      autoUseCard = wasTimeout && account.profile.rider.timeoutCardCount > 0
      updatedOrder = order.copy(status = targetStatus)
      remainingPending <- OrderTable.countActiveByRider(connection, account.profile.rider.id, excludingOrderId = Some(orderId))
      nextStatus = if remainingPending > 0 then RiderStatus.配送中 else RiderStatus.空闲
      currentRider = account.profile.rider
      updatedRider = currentRider.copy(
        status = nextStatus,
        salary = currentRider.salary + 5,
        energyPoints = currentRider.energyPoints + earnedEnergy,
        timeoutCardCount = if autoUseCard then currentRider.timeoutCardCount - 1 else currentRider.timeoutCardCount,
        timeoutCount = if wasTimeout then currentRider.timeoutCount + 1 else currentRider.timeoutCount,
        timeoutExemptedCount = if autoUseCard then currentRider.timeoutExemptedCount + 1 else currentRider.timeoutExemptedCount
      )
      _ <- OrderTable.upsert(connection, updatedOrder)
      _ <- RiderAccountTable.upsert(connection, account.copy(profile = account.profile.copy(rider = updatedRider)))
      _ <- RiderAssignmentTable.completeDelivery(
        connection,
        updatedRider.id,
        updatedOrder.id,
        updatedOrder.status,
        completedAt,
        deadlineAt,
        wasTimeout,
        autoUseCard,
        autoUseCard,
        overtimeSeconds
      )
    yield RiderDeliverySettlement(
      ok = true,
      orderId = orderId,
      earnedEnergy = earnedEnergy,
      currentEnergyPoints = updatedRider.energyPoints,
      currentTimeoutCardCount = updatedRider.timeoutCardCount,
      wasTimeout = wasTimeout,
      timeoutCardUsed = autoUseCard,
      timeoutExempted = autoUseCard,
      overtimeSeconds = overtimeSeconds
    )
