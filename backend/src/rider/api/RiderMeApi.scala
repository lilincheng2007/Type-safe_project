package delivery.rider.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.http.support.AuthHttp
import delivery.rider.objects.{RiderAccountPublic, RiderMeResponse}
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.{DeliveryState, ErrorBody}
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object RiderMeApi:

  def routes(ref: Ref[IO, DeliveryState]): HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ GET -> Root / "api" / "auth" / "me" =>
      AuthHttp.requireRole(req, "rider") { username =>
        ref.get.flatMap { state =>
          state.rider.riderAccounts.find(_.username == username) match
            case None => NotFound(ErrorBody("未找到账号"))
            case Some(account) =>
              Ok(
                RiderMeResponse(
                  username = username,
                  role = "rider",
                  riderAccount = RiderAccountPublic(account.role, account.username, account.profile)
                )
              )
        }
      }
  }

end RiderMeApi
