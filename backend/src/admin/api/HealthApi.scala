package delivery.admin.api

import cats.effect.IO
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.HealthOk
import io.circe.Json
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.circe.jsonEncoder
import org.http4s.dsl.io.*

object HealthApi:

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case GET -> Root =>
      Ok(
        Json.obj(
          "service" -> Json.fromString("delivery-backend"),
          "message" -> Json.fromString("单体服务，按 admin/order/user/merchant/rider 逻辑分层")
        )
      )

    case GET -> Root / "api" / "health" =>
      Ok(HealthOk(ok = true))
  }

end HealthApi
