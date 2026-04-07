package merchantservice

import cats.effect.IO
import cats.effect.kernel.Ref
import cats.syntax.all.*
import delivery.http.support.{AuthHttp, MeJson}
import delivery.interop.InternalToken
import delivery.model.*
import delivery.model.JsonCodecs.given
import delivery.store.MerchantDomainOps
import io.circe.Json
import org.http4s.*
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object MerchantRoutes:

  def apply(ref: Ref[IO, MerchantServiceState], persist: MerchantServiceState => IO[Unit]): HttpRoutes[IO] =
    val public = HttpRoutes.of[IO] {
      case GET -> Root =>
        Ok(Json.obj("service" -> Json.fromString("merchant-service")))

      case GET -> Root / "api" / "health" =>
        Ok(JsonCodecs.HealthOk(true))

      case GET -> Root / "api" / "delivery" / "catalog" =>
        ref.get.flatMap { s =>
          Ok(CatalogResponse(s.catalogMerchants, s.catalogProducts))
        }

      case req @ GET -> Root / "api" / "auth" / "me" =>
        AuthHttp.requireRole(req, "merchant") { user =>
          ref.get.flatMap { st =>
            MeJson.merchant(st, user) match
              case Left(msg) => NotFound(ErrorBody(msg))
              case Right(j)  => Ok(j)
          }
        }

      case req @ PUT -> Root / "api" / "delivery" / "me" / "merchant" / "profile" =>
        AuthHttp.requireRole(req, "merchant") { user =>
          for
            body <- req.as[MerchantProfileBody]
            st <- ref.get
            resp <- MerchantDomainOps.replaceMerchantProfile(st, user, body.profile) match
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right(ns) => ref.set(ns) *> persist(ns) *> Ok(OkResponse(true))
          yield resp
        }

      case req @ POST -> Root / "api" / "delivery" / "me" / "merchant" / "stores" =>
        AuthHttp.requireRole(req, "merchant") { user =>
          for
            body <- req.as[CreateStoreRequest]
            st <- ref.get
            resp <- MerchantDomainOps.createMerchantStore(st, user, body.storeName, body.address) match
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right((ns, mid)) =>
                ref.set(ns) *> persist(ns) *> Ok(CreateStoreResponse(ok = true, merchantId = mid))
          yield resp
        }
    }

    val internal = HttpRoutes.of[IO] {
      case req @ POST -> Root / "internal" / "bootstrap-merchant" =>
        if !InternalToken.authorize(req) then Forbidden(ErrorBody("内部调用拒绝"))
        else
          for
            body <- req.as[BootstrapUserRequest]
            st <- ref.get
            resp <- MerchantDomainOps.bootstrapMerchant(st, body.username) match
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right(ns) => ref.set(ns) *> persist(ns) *> Ok(OkResponse(true))
          yield resp

      case req @ POST -> Root / "internal" / "attach-orders" =>
        if !InternalToken.authorize(req) then Forbidden(ErrorBody("内部调用拒绝"))
        else
          for
            body <- req.as[AttachOrdersRequest]
            st <- ref.get
            ns = MerchantDomainOps.attachOrders(st, body.orders)
            _ <- ref.set(ns)
            _ <- persist(ns)
            resp <- Ok(OkResponse(true))
          yield resp

      case req @ GET -> Root / "internal" / "catalog" =>
        if !InternalToken.authorize(req) then Forbidden(ErrorBody("内部调用拒绝"))
        else ref.get.flatMap(s => Ok(CatalogResponse(s.catalogMerchants, s.catalogProducts)))
    }

    public <+> internal

end MerchantRoutes
