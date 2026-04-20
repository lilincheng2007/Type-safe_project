package delivery.merchant.routes

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.http.AuthHttp
import delivery.merchant.api.*
import delivery.merchant.objects.{CreateProductRequest, CreateStoreRequest, MerchantProfileBody, UpdateProductRequest}
import delivery.merchant.utils.MerchantApiSupport
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.{DeliveryState, ErrorBody}
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object MerchantRoutes:

  def routes(ref: Ref[IO, DeliveryState], persist: DeliveryState => IO[Unit]): HttpRoutes[IO] =
    HttpRoutes.of[IO] {
      case GET -> Root / "catalog" =>
        ref.get.flatMap(state => CatalogApi.plan(CatalogApi.CatalogQuery(state))).flatMap(Ok(_))

      case req @ GET -> Root / "me" =>
        AuthHttp.requireRole(req, "merchant") { username =>
          ref.get.flatMap(state => MerchantMeApi.plan(MerchantMeApi.MerchantMeQuery(state, username))).flatMap {
            case None => NotFound(MerchantApiSupport.merchantNotFound)
            case Some(output) => Ok(output)
          }
        }

      case req @ PUT -> Root / "me" / "profile" =>
        AuthHttp.requireRole(req, "merchant") { username =>
          for
            body <- req.as[MerchantProfileBody]
            current <- ref.get
            response <- MerchantProfileApi
              .plan(MerchantProfileApi.MerchantProfileCommand(current, username, body))
              .flatMap {
                case Left(msg) => BadRequest(ErrorBody(msg))
                case Right(output) => ref.set(output.nextState) *> persist(output.nextState) *> Ok(output.response)
              }
          yield response
        }

      case req @ POST -> Root / "me" / "stores" =>
        AuthHttp.requireRole(req, "merchant") { username =>
          for
            body <- req.as[CreateStoreRequest]
            current <- ref.get
            response <- MerchantStoreApi.plan(MerchantStoreApi.MerchantStoreCommand(current, username, body)).flatMap {
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right(output) => ref.set(output.nextState) *> persist(output.nextState) *> Ok(output.response)
            }
          yield response
        }

      case req @ POST -> Root / "me" / "products" =>
        AuthHttp.requireRole(req, "merchant") { username =>
          for
            body <- req.as[CreateProductRequest]
            current <- ref.get
            response <- MerchantCreateProductApi.plan(MerchantCreateProductApi.MerchantCreateProductCommand(current, username, body)).flatMap {
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right(output) => ref.set(output.nextState) *> persist(output.nextState) *> Ok(output.response)
            }
          yield response
        }

      case req @ PUT -> Root / "me" / "products" / productId =>
        AuthHttp.requireRole(req, "merchant") { username =>
          for
            body <- req.as[UpdateProductRequest]
            current <- ref.get
            response <- MerchantProductApi.plan(MerchantProductApi.MerchantProductCommand(current, username, productId, body)).flatMap {
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right(output) => ref.set(output.nextState) *> persist(output.nextState) *> Ok(output.response)
            }
          yield response
        }

      case req @ POST -> Root / "me" / "orders" / orderId / "finish" =>
        AuthHttp.requireRole(req, "merchant") { username =>
          for
            current <- ref.get
            response <- MerchantOrderReadyApi.plan(MerchantOrderReadyApi.MerchantOrderReadyCommand(current, username, orderId)).flatMap {
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right(output) => ref.set(output.nextState) *> persist(output.nextState) *> Ok(output.response)
            }
          yield response
        }

      case req @ POST -> Root / "me" / "orders" / orderId / "ready" =>
        AuthHttp.requireRole(req, "merchant") { username =>
          for
            current <- ref.get
            response <- MerchantOrderReadyApi.plan(MerchantOrderReadyApi.MerchantOrderReadyCommand(current, username, orderId)).flatMap {
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right(output) => ref.set(output.nextState) *> persist(output.nextState) *> Ok(output.response)
            }
          yield response
        }
    }

end MerchantRoutes
