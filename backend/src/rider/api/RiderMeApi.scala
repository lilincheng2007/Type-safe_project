package delivery.rider.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.rider.objects.RiderMeResponse
import delivery.rider.service.RiderService
import delivery.shared.objects.DeliveryState
import org.typelevel.log4cats.slf4j.Slf4jLogger

object RiderMeApi extends ApiPlan[RiderMeApi.RiderMeQuery, Option[RiderMeResponse]]:

  final case class RiderMeQuery(ref: Ref[IO, DeliveryState], username: String)

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "RiderMeApi"

  override def plan(input: RiderMeApi.RiderMeQuery): IO[Option[RiderMeResponse]] =
    for
      _ <- logger.info(s"$name started, username=${input.username}")
      response <- RiderService.fetchRiderMe(input.ref, input.username)
      _ <- logger.info(s"$name finished, found=${response.isDefined}")
    yield response

end RiderMeApi
