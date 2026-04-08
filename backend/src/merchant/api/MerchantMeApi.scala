package delivery.merchant.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.http.support.AuthHttp
import delivery.merchant.objects.{MerchantAccountPublic, MerchantMeResponse}
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.{DeliveryState, ErrorBody}
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object MerchantMeApi:

  def routes(ref: Ref[IO, DeliveryState]): HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ GET -> Root / "api" / "auth" / "me" =>
      AuthHttp.requireRole(req, "merchant") { username =>
        ref.get.flatMap { state =>
          state.merchant.merchantAccounts.find(_.username == username) match
            case None => NotFound(ErrorBody("未找到账号"))
            case Some(account) =>
              Ok(
                MerchantMeResponse(
                  username = username,
                  role = "merchant",
                  merchantAccount = MerchantAccountPublic(account.role, account.username, account.profile)
                )
              )
        }
      }
  }

end MerchantMeApi
