package delivery.merchant.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.http.support.AuthHttp
import delivery.merchant.objects.MerchantProfileBody
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.{DeliveryState, ErrorBody, OkResponse}
import delivery.store.MerchantDomainOps
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object MerchantProfileApi:

  def routes(ref: Ref[IO, DeliveryState], persist: DeliveryState => IO[Unit]): HttpRoutes[IO] =
    HttpRoutes.of[IO] {
      case req @ PUT -> Root / "api" / "delivery" / "me" / "merchant" / "profile" =>
        AuthHttp.requireRole(req, "merchant") { username =>
          for
            body <- req.as[MerchantProfileBody]
            current <- ref.get
            resp <- MerchantDomainOps.replaceMerchantProfile(current.merchant, username, body.profile) match
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right(nextMerchant) =>
                val next = current.copy(merchant = nextMerchant)
                ref.set(next) *> persist(next) *> Ok(OkResponse(ok = true))
          yield resp
        }
    }

end MerchantProfileApi
