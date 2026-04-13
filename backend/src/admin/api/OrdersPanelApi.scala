package delivery.admin.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.admin.service.AdminService
import delivery.admin.objects.OrdersPanelResponse
import delivery.shared.objects.DeliveryState

object OrdersPanelApi extends ApiPlan[OrdersPanelApi.OrdersPanelQuery, OrdersPanelResponse]:

  final case class OrdersPanelQuery(ref: Ref[IO, DeliveryState])

  override val name: String = "OrdersPanelApi"

  override def plan(input: OrdersPanelApi.OrdersPanelQuery): IO[OrdersPanelResponse] =
    AdminService.fetchOrdersPanel(input.ref)

end OrdersPanelApi
