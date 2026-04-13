package delivery.admin.api

import cats.effect.IO
import delivery.admin.service.AdminService
import delivery.shared.api.ApiPlan
import io.circe.Json

object RootInfoApi extends ApiPlan[RootInfoApi.RootInfoQuery.type, Json]:

  case object RootInfoQuery

  override val name: String = "RootInfoApi"

  override def plan(input: RootInfoApi.RootInfoQuery.type): IO[Json] =
    IO.pure(
      Json.obj(
        "service" -> Json.fromString("delivery-backend"),
        "message" -> Json.fromString("单体服务，按 admin/order/user/merchant/rider 逻辑分层"),
        "modules" -> AdminService.moduleMetadataJson
      )
    )

end RootInfoApi
