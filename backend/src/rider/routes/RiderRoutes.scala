package delivery.rider.routes

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.rider.api.RiderMeApi
import delivery.rider.utils.RiderApiSupport
import delivery.shared.http.AuthHttp
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.DeliveryState
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object RiderRoutes:

  def routes(ref: Ref[IO, DeliveryState]): HttpRoutes[IO] =
    HttpRoutes.of[IO] {
      case req @ GET -> Root / "me" =>
        AuthHttp.requireRole(req, "rider") { username =>
          ref.get.flatMap(state => RiderMeApi.plan(RiderMeApi.RiderMeQuery(state, username))).flatMap {
            case None => NotFound(RiderApiSupport.riderNotFound)
            case Some(output) => Ok(output)
          }
        }
    }

end RiderRoutes
