package delivery.admin.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.admin.service.AdminService
import delivery.admin.objects.OverviewResponse
import delivery.shared.objects.DeliveryState

object OverviewApi extends ApiPlan[OverviewApi.OverviewQuery, OverviewResponse]:

  final case class OverviewQuery(ref: Ref[IO, DeliveryState])

  override val name: String = "OverviewApi"

  override def plan(input: OverviewApi.OverviewQuery): IO[OverviewResponse] =
    AdminService.fetchOverview(input.ref)

end OverviewApi
