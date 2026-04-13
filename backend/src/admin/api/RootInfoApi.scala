package delivery.admin.api

import cats.effect.IO
import delivery.admin.service.AdminService
import delivery.shared.api.ApiPlan
import io.circe.Json
import org.typelevel.log4cats.slf4j.Slf4jLogger

object RootInfoApi extends ApiPlan[RootInfoApi.RootInfoQuery.type, Json]:

  case object RootInfoQuery

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "RootInfoApi"

  override def plan(input: RootInfoApi.RootInfoQuery.type): IO[Json] =
    for
      _ <- logger.info(s"$name started")
      response <- IO.pure(
        Json.obj(
          "service" -> Json.fromString("delivery-backend"),
          "message" -> Json.fromString("单体服务，按 admin/order/user/merchant/rider 逻辑分层"),
          "modules" -> AdminService.moduleMetadataJson
        )
      )
      _ <- logger.info(s"$name finished")
    yield response

end RootInfoApi
