package delivery.admin.api

import cats.effect.IO
import delivery.admin.objects.OverviewResponse
import delivery.admin.utils.AdminApiSupport
import delivery.shared.api.ApiPlan
import delivery.shared.objects.DeliveryState
import org.typelevel.log4cats.slf4j.Slf4jLogger

object OverviewApi extends ApiPlan[OverviewApi.OverviewQuery, OverviewResponse]:

  final case class OverviewQuery(state: DeliveryState)

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "OverviewApi"

  override def plan(input: OverviewApi.OverviewQuery): IO[OverviewResponse] =
    for
      _ <- logger.info(s"$name started")
      response = AdminApiSupport.overview(input.state)
      _ <- logger.info(s"$name finished")
    yield response

end OverviewApi
