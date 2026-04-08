package delivery.admin.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.admin.objects.{AdminAccountPublic, AdminMeResponse}
import delivery.http.support.AuthHttp
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.{DeliveryState, ErrorBody}
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object AdminMeApi:

  def routes(ref: Ref[IO, DeliveryState]): HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ GET -> Root / "api" / "auth" / "me" =>
      AuthHttp.requireRole(req, "admin") { username =>
        ref.get.flatMap { state =>
          state.admin.adminAccounts.find(_.username == username) match
            case None => NotFound(ErrorBody("未找到账号"))
            case Some(account) =>
              Ok(
                AdminMeResponse(
                  username = username,
                  role = "admin",
                  adminAccount = AdminAccountPublic(account.role, account.username, account.displayName)
                )
              )
        }
      }
  }

end AdminMeApi
