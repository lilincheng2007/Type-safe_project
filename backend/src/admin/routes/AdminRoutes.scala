package delivery.admin.routes

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.admin.api.*
import delivery.admin.service.AdminService
import delivery.admin.utils.AdminApiSupport
import delivery.http.support.AuthHttp
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.DeliveryState
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.circe.jsonEncoder
import org.http4s.dsl.io.*

object AdminRoutes:

  def routes(ref: Ref[IO, DeliveryState]): HttpRoutes[IO] =
    HttpRoutes.of[IO] {
      case GET -> Root =>
        RootInfoApi.plan(RootInfoApi.RootInfoQuery).flatMap(Ok(_))

      case GET -> Root / "api" / "health" =>
        HealthApi.plan(HealthApi.HealthQuery).flatMap(Ok(_))

      case req @ GET -> Root / "api" / "auth" / "me" =>
        AuthHttp.requireRole(req, "admin") { username =>
          AdminMeApi.plan(AdminMeApi.AdminMeQuery(ref, username)).flatMap {
            case None => NotFound(AdminApiSupport.adminNotFound)
            case Some(output) => Ok(output)
          }
        }

      case req @ GET -> Root / "api" / "delivery" / "overview" =>
        AuthHttp.requireRole(req, "admin") { _ =>
          OverviewApi.plan(OverviewApi.OverviewQuery(ref)).flatMap(Ok(_))
        }

      case req @ GET -> Root / "api" / "delivery" / "orders-panel" =>
        AuthHttp.requireRole(req, "admin") { _ =>
          OrdersPanelApi.plan(OrdersPanelApi.OrdersPanelQuery(ref)).flatMap(Ok(_))
        }

      case req @ GET -> Root / "api" / "delivery" / "platform-meta" =>
        AuthHttp.requireRole(req, "admin") { _ =>
          PlatformMetaApi.plan(PlatformMetaApi.PlatformMetaQuery(ref)).flatMap(Ok(_))
        }
    }

end AdminRoutes
