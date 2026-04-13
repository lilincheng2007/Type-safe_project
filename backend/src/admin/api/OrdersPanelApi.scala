package delivery.admin.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.admin.service.AdminService
import delivery.admin.objects.OrdersPanelResponse
import delivery.shared.objects.DeliveryState
import org.typelevel.log4cats.slf4j.Slf4jLogger

object OrdersPanelApi extends ApiPlan[OrdersPanelApi.OrdersPanelQuery, OrdersPanelResponse]:

  final case class OrdersPanelQuery(ref: Ref[IO, DeliveryState])

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "OrdersPanelApi"

  override def plan(input: OrdersPanelApi.OrdersPanelQuery): IO[OrdersPanelResponse] =
    for
      _ <- logger.info(s"$name started")
      response <- AdminService.fetchOrdersPanel(input.ref)
      _ <- logger.info(s"$name finished, orders=${response.orders.size}")
    yield response

end OrdersPanelApi
