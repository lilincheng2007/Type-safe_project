package delivery.admin.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.admin.service.AdminService
import delivery.admin.objects.OverviewResponse
import delivery.shared.objects.DeliveryState
import org.typelevel.log4cats.slf4j.Slf4jLogger

object OverviewApi extends ApiPlan[OverviewApi.OverviewQuery, OverviewResponse]:

  final case class OverviewQuery(ref: Ref[IO, DeliveryState])

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "OverviewApi"

  override def plan(input: OverviewApi.OverviewQuery): IO[OverviewResponse] =
    for
      _ <- logger.info(s"$name started")
      response <- AdminService.fetchOverview(input.ref)
      _ <- logger.info(s"$name finished")
    yield response

end OverviewApi
