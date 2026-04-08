package delivery.admin.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.admin.objects.PlatformMetaResponse
import delivery.http.support.AuthHttp
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.DeliveryState
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object PlatformMetaApi:

  def routes(ref: Ref[IO, DeliveryState]): HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ GET -> Root / "api" / "delivery" / "platform-meta" =>
      AuthHttp.requireRole(req, "admin") { _ =>
        ref.get.flatMap { state =>
          Ok(
            PlatformMetaResponse(
              campaigns = state.admin.campaigns,
              complaintTickets = state.admin.complaintTickets,
              merchantApplications = state.admin.merchantApplications,
              serviceAgents = state.admin.serviceAgents,
              operationsManagers = state.admin.operationsManagers
            )
          )
        }
      }
  }

end PlatformMetaApi
