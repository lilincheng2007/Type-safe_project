package delivery.user.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.http.support.AuthHttp
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.{DeliveryState, ErrorBody}
import delivery.user.objects.{CustomerAccountPublic, CustomerMeResponse}
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object CustomerMeApi:

  def routes(ref: Ref[IO, DeliveryState]): HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ GET -> Root / "api" / "auth" / "me" =>
      AuthHttp.requireRole(req, "customer") { username =>
        ref.get.flatMap { state =>
          state.user.customerAccounts.find(_.username == username) match
            case None => NotFound(ErrorBody("未找到账号"))
            case Some(account) =>
              Ok(
                CustomerMeResponse(
                  username = username,
                  role = "customer",
                  customerAccount = CustomerAccountPublic(account.role, account.username, account.profile)
                )
              )
        }
      }
  }

end CustomerMeApi
