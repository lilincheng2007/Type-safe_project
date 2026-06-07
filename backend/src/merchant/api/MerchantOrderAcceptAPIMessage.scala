package delivery.merchant.api

import cats.effect.IO
import delivery.order.api.OrderStatusTransitionService
import delivery.order.tables.order.OrderTable
import delivery.shared.api.{APIWithRoleMessage, HttpApiError}
import delivery.shared.objects.{OrderId, OrderStatus}
import delivery.shared.objects.apiTypes.OkResponse

import java.sql.Connection
import java.time.{Instant, ZoneId}
import java.time.format.DateTimeFormatter

final case class MerchantOrderAcceptAPIMessage(orderId: OrderId, prepMinutes: Option[Int] = None) extends APIWithRoleMessage[OkResponse]:
  override def plan(connection: Connection, username: String): IO[OkResponse] =
    for
      order <- OrderTable.findById(connection, orderId).flatMap {
        case Some(value) => IO.pure(value)
        case None        => IO.raiseError(HttpApiError.BadRequest("未找到订单"))
      }
      _ <- MerchantAPIMessageSupport.requireOwnedStore(connection, username, order.merchantId)
      safePrepMinutes = prepMinutes.map(value => math.max(1, math.min(180, value))).getOrElse(15)
      readyAt = Instant.now().plusSeconds(safePrepMinutes.toLong * 60)
      readyAtText = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").withZone(ZoneId.systemDefault()).format(readyAt)
      _ <- OrderStatusTransitionService.transition(
        connection,
        order,
        OrderStatus.制作中,
        actorRole = "merchant",
        patch = _.copy(estimatedPrepMinutes = Some(safePrepMinutes), estimatedReadyAt = Some(readyAtText))
      )
    yield OkResponse(ok = true)
