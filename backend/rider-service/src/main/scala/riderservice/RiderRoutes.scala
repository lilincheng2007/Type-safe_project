package riderservice

import cats.effect.IO
import cats.effect.kernel.Ref
import cats.syntax.all.*
import delivery.http.support.{AuthHttp, MeJson}
import delivery.interop.InternalToken
import delivery.model.*
import delivery.model.JsonCodecs.given
import delivery.store.RiderDomainOps
import io.circe.Json
import org.http4s.*
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object RiderRoutes:

  def apply(ref: Ref[IO, RiderServiceState], persist: RiderServiceState => IO[Unit]): HttpRoutes[IO] =
    val public = HttpRoutes.of[IO] {
      case GET -> Root =>
        Ok(Json.obj("service" -> Json.fromString("rider-service")))

      case GET -> Root / "api" / "health" =>
        Ok(JsonCodecs.HealthOk(true))

      case req @ GET -> Root / "api" / "auth" / "me" =>
        AuthHttp.requireRole(req, "rider") { user =>
          ref.get.flatMap { st =>
            MeJson.rider(st, user) match
              case Left(msg) => NotFound(ErrorBody(msg))
              case Right(j)  => Ok(j)
          }
        }
    }

    val internal = HttpRoutes.of[IO] {
      case req @ POST -> Root / "internal" / "bootstrap-rider" =>
        if !InternalToken.authorize(req) then Forbidden(ErrorBody("内部调用拒绝"))
        else
          for
            body <- req.as[BootstrapUserRequest]
            st <- ref.get
            resp <- RiderDomainOps.bootstrapRider(st, body.username) match
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right(ns) => ref.set(ns) *> persist(ns) *> Ok(OkResponse(true))
          yield resp

      case req @ GET -> Root / "internal" / "riders" =>
        if !InternalToken.authorize(req) then Forbidden(ErrorBody("内部调用拒绝"))
        else ref.get.flatMap(s => Ok(RiderAdminExport(s.riders)))
    }

    public <+> internal

end RiderRoutes
