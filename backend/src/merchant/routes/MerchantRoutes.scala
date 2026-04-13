package delivery.merchant.routes

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.http.support.AuthHttp
import delivery.merchant.api.*
import delivery.merchant.objects.{CreateStoreRequest, MerchantProfileBody}
import delivery.merchant.utils.MerchantApiSupport
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.{DeliveryState, ErrorBody}
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object MerchantRoutes:

  def routes(ref: Ref[IO, DeliveryState], persist: DeliveryState => IO[Unit]): HttpRoutes[IO] =
    HttpRoutes.of[IO] {
      case GET -> Root / "api" / "delivery" / "catalog" =>
        CatalogApi.plan(CatalogApi.CatalogQuery(ref)).flatMap(Ok(_))

      case req @ GET -> Root / "api" / "auth" / "me" =>
        AuthHttp.requireRole(req, "merchant") { username =>
          MerchantMeApi.plan(MerchantMeApi.MerchantMeQuery(ref, username)).flatMap {
            case None => NotFound(MerchantApiSupport.merchantNotFound)
            case Some(output) => Ok(output)
          }
        }

      case req @ PUT -> Root / "api" / "delivery" / "me" / "merchant" / "profile" =>
        AuthHttp.requireRole(req, "merchant") { username =>
          for
            body <- req.as[MerchantProfileBody]
            response <- MerchantProfileApi
              .plan(MerchantProfileApi.MerchantProfileCommand(ref, persist, username, body))
              .flatMap {
                case Left(msg) => BadRequest(ErrorBody(msg))
                case Right(output) => Ok(output)
              }
          yield response
        }

      case req @ POST -> Root / "api" / "delivery" / "me" / "merchant" / "stores" =>
        AuthHttp.requireRole(req, "merchant") { username =>
          for
            body <- req.as[CreateStoreRequest]
            response <- MerchantStoreApi.plan(MerchantStoreApi.MerchantStoreCommand(ref, persist, username, body)).flatMap {
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right(output) => Ok(output)
            }
          yield response
        }
    }

end MerchantRoutes
