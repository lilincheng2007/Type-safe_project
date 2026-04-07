package gateway

import cats.effect.IO
import cats.syntax.all.*
import delivery.http.support.AuthHttp
import delivery.model.{ErrorBody, JsonCodecs}
import delivery.model.JsonCodecs.given
import io.circe.Json
import org.http4s.*
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.client.Client
import org.http4s.dsl.io.*
import org.http4s.implicits.*

object GatewayRoutes:

  private def forward(client: Client[IO], base: Uri)(req: Request[IO]): IO[Response[IO]] =
    val dest = base.withPath(req.uri.path).copy(query = req.uri.query)
    client.run(req.withUri(dest)).use(IO.pure)

  def apply(
      client: Client[IO],
      userBase: Uri,
      orderBase: Uri,
      merchantBase: Uri,
      riderBase: Uri,
      adminBase: Uri
  ): HttpRoutes[IO] =
    HttpRoutes.of[IO] {
      case GET -> Root =>
        Ok(
          Json.obj(
            "service" -> Json.fromString("api-gateway"),
            "message" -> Json.fromString("微服务聚合入口；下游见环境变量 USER_SERVICE_URL 等")
          )
        )

      case GET -> Root / "api" / "health" =>
        Ok(JsonCodecs.HealthOk(true))

      case req @ GET -> Root / "api" / "auth" / "me" =>
        AuthHttp.withBearer(req) { (_, role) =>
          role match
            case "customer" => forward(client, userBase)(req)
            case "merchant" => forward(client, merchantBase)(req)
            case "rider"    => forward(client, riderBase)(req)
            case "admin"    => forward(client, adminBase)(req)
            case _          => Response[IO](Status.Forbidden).withEntity(ErrorBody("无效角色")).pure[IO]
        }

      case req if req.uri.path.startsWith(path"/api/auth") =>
        forward(client, userBase)(req)

      case req if req.uri.path.startsWith(path"/api/delivery/catalog") =>
        forward(client, merchantBase)(req)

      case req if req.uri.path.startsWith(path"/api/delivery/me/merchant") =>
        forward(client, merchantBase)(req)

      case req if req.uri.path.startsWith(path"/api/delivery/me/customer/checkout") =>
        forward(client, orderBase)(req)

      case req if req.uri.path.startsWith(path"/api/delivery/me/customer/profile") =>
        forward(client, userBase)(req)

      case req
          if req.uri.path.startsWith(path"/api/delivery/overview") ||
            req.uri.path.startsWith(path"/api/delivery/orders-panel") ||
            req.uri.path.startsWith(path"/api/delivery/platform-meta") =>
        forward(client, adminBase)(req)
    }

end GatewayRoutes
