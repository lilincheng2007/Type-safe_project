package delivery.merchant.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.http.support.AuthHttp
import delivery.merchant.objects.{CreateStoreRequest, CreateStoreResponse}
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.{DeliveryState, ErrorBody}
import delivery.store.MerchantDomainOps
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object MerchantStoreApi:

  def routes(ref: Ref[IO, DeliveryState], persist: DeliveryState => IO[Unit]): HttpRoutes[IO] =
    HttpRoutes.of[IO] {
      case req @ POST -> Root / "api" / "delivery" / "me" / "merchant" / "stores" =>
        AuthHttp.requireRole(req, "merchant") { username =>
          for
            body <- req.as[CreateStoreRequest]
            current <- ref.get
            resp <- MerchantDomainOps.createMerchantStore(current.merchant, username, body.storeName, body.address) match
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right((nextMerchant, merchantId)) =>
                val next = current.copy(merchant = nextMerchant)
                ref.set(next) *> persist(next) *> Ok(CreateStoreResponse(ok = true, merchantId = merchantId))
          yield resp
        }
    }

end MerchantStoreApi
