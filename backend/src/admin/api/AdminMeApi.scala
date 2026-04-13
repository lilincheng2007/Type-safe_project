package delivery.admin.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.admin.service.AdminService
import delivery.admin.objects.AdminMeResponse
import delivery.shared.objects.DeliveryState
import org.typelevel.log4cats.slf4j.Slf4jLogger

object AdminMeApi extends ApiPlan[AdminMeApi.AdminMeQuery, Option[AdminMeResponse]]:

  final case class AdminMeQuery(ref: Ref[IO, DeliveryState], username: String)

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "AdminMeApi"

  override def plan(input: AdminMeApi.AdminMeQuery): IO[Option[AdminMeResponse]] =
    for
      _ <- logger.info(s"$name started, username=${input.username}")
      response <- AdminService.fetchAdminMe(input.ref, input.username)
      _ <- logger.info(s"$name finished, found=${response.isDefined}")
    yield response

end AdminMeApi
