package delivery.admin.api

import cats.effect.IO
import delivery.admin.objects.OrdersPanelResponse
import delivery.admin.utils.AdminApiSupport
import delivery.shared.api.ApiPlan
import delivery.shared.objects.DeliveryState
import org.typelevel.log4cats.slf4j.Slf4jLogger

object OrdersPanelApi extends ApiPlan[OrdersPanelApi.OrdersPanelQuery, OrdersPanelResponse]:

  final case class OrdersPanelQuery(state: DeliveryState)

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "OrdersPanelApi"

  override def plan(input: OrdersPanelApi.OrdersPanelQuery): IO[OrdersPanelResponse] =
    for
      _ <- logger.info(s"$name started")
      response = AdminApiSupport.ordersPanel(input.state)
      _ <- logger.info(s"$name finished, orders=${response.orders.size}")
    yield response

end OrdersPanelApi
