package delivery.admin.api

import cats.effect.IO
import delivery.admin.objects.AdminMeResponse
import delivery.admin.utils.AdminApiSupport
import delivery.shared.api.ApiPlan
import delivery.shared.objects.DeliveryState
import org.typelevel.log4cats.slf4j.Slf4jLogger

object AdminMeApi extends ApiPlan[AdminMeApi.AdminMeQuery, Option[AdminMeResponse]]:

  final case class AdminMeQuery(state: DeliveryState, username: String)

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "AdminMeApi"

  override def plan(input: AdminMeApi.AdminMeQuery): IO[Option[AdminMeResponse]] =
    for
      _ <- logger.info(s"$name started, username=${input.username}")
      response = input.state.admin.adminAccounts.find(_.username == input.username).map(account => AdminApiSupport.adminMeResponse(input.username, account))
      _ <- logger.info(s"$name finished, found=${response.isDefined}")
    yield response

end AdminMeApi
