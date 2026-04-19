package delivery.admin.routes

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.admin.api.*
import delivery.admin.utils.AdminApiSupport
import delivery.shared.http.AuthHttp
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.DeliveryState
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object AdminRoutes:

  def routes(ref: Ref[IO, DeliveryState]): HttpRoutes[IO] =
    HttpRoutes.of[IO] {
      case GET -> Root =>
        RootInfoApi.plan(RootInfoApi.RootInfoQuery).flatMap(Ok(_))

      case GET -> Root / "health" =>
        HealthApi.plan(HealthApi.HealthQuery).flatMap(Ok(_))

      case req @ GET -> Root / "me" =>
        AuthHttp.requireRole(req, "admin") { username =>
          ref.get.flatMap(state => AdminMeApi.plan(AdminMeApi.AdminMeQuery(state, username))).flatMap {
            case None => NotFound(AdminApiSupport.adminNotFound)
            case Some(output) => Ok(output)
          }
        }

      case req @ GET -> Root / "overview" =>
        AuthHttp.requireRole(req, "admin") { _ =>
          ref.get.flatMap(state => OverviewApi.plan(OverviewApi.OverviewQuery(state))).flatMap(Ok(_))
        }

      case req @ GET -> Root / "orders-panel" =>
        AuthHttp.requireRole(req, "admin") { _ =>
          ref.get.flatMap(state => OrdersPanelApi.plan(OrdersPanelApi.OrdersPanelQuery(state))).flatMap(Ok(_))
        }

      case req @ GET -> Root / "platform-meta" =>
        AuthHttp.requireRole(req, "admin") { _ =>
          ref.get.flatMap(state => PlatformMetaApi.plan(PlatformMetaApi.PlatformMetaQuery(state))).flatMap(Ok(_))
        }
    }

end AdminRoutes
