package delivery.admin.api

import cats.effect.IO
import delivery.admin.objects.PlatformMetaResponse
import delivery.admin.utils.AdminApiSupport
import delivery.shared.api.ApiPlan
import delivery.shared.objects.DeliveryState
import org.typelevel.log4cats.slf4j.Slf4jLogger

object PlatformMetaApi extends ApiPlan[PlatformMetaApi.PlatformMetaQuery, PlatformMetaResponse]:

  final case class PlatformMetaQuery(state: DeliveryState)

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "PlatformMetaApi"

  override def plan(input: PlatformMetaApi.PlatformMetaQuery): IO[PlatformMetaResponse] =
    for
      _ <- logger.info(s"$name started")
      response = AdminApiSupport.platformMeta(input.state)
      _ <- logger.info(s"$name finished")
    yield response

end PlatformMetaApi
