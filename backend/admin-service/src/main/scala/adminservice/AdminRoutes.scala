package adminservice

import cats.effect.IO
import cats.effect.kernel.Ref
import cats.syntax.all.*
import delivery.http.support.{AuthHttp, MeJson}
import delivery.interop.InternalToken
import delivery.model.*
import delivery.model.JsonCodecs.given
import io.circe.Json
import org.http4s.*
import org.http4s.Method.GET
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.client.Client
import org.http4s.dsl.io.*

object AdminRoutes:

  def apply(
      httpClient: Client[IO],
      ref: Ref[IO, AdminServiceState],
      orderBaseUrl: String,
      merchantBaseUrl: String,
      riderBaseUrl: String
  ): HttpRoutes[IO] =
    val ordersUri = Uri.unsafeFromString(s"${orderBaseUrl.stripSuffix("/")}/internal/orders")
    val catalogUri = Uri.unsafeFromString(s"${merchantBaseUrl.stripSuffix("/")}/internal/catalog")
    val ridersUri = Uri.unsafeFromString(s"${riderBaseUrl.stripSuffix("/")}/internal/riders")

    HttpRoutes.of[IO] {
      case GET -> Root =>
        Ok(Json.obj("service" -> Json.fromString("admin-service")))

      case GET -> Root / "api" / "health" =>
        Ok(JsonCodecs.HealthOk(true))

      case req @ GET -> Root / "api" / "auth" / "me" =>
        AuthHttp.requireRole(req, "admin") { user =>
          ref.get.flatMap { st =>
            MeJson.admin(st, user) match
              case Left(msg) => NotFound(ErrorBody(msg))
              case Right(j)  => Ok(j)
          }
        }

      case req @ GET -> Root / "api" / "delivery" / "overview" =>
        AuthHttp.requireRole(req, "admin") { _ =>
          val oReq = Request[IO](GET, ordersUri).withHeaders(InternalToken.header)
          val cReq = Request[IO](GET, catalogUri).withHeaders(InternalToken.header)
          val rReq = Request[IO](GET, ridersUri).withHeaders(InternalToken.header)
          (
            httpClient.expect[OrderBatch](oReq),
            httpClient.expect[CatalogResponse](cReq),
            httpClient.expect[RiderAdminExport](rReq),
            ref.get
          ).mapN { (ob, cat, re, st) =>
            OverviewResponse(
              merchants = cat.merchants,
              orders = ob.orders,
              riders = re.riders,
              campaigns = st.campaigns,
              complaintTickets = st.complaintTickets
            )
          }.flatMap(Ok(_))
        }

      case req @ GET -> Root / "api" / "delivery" / "orders-panel" =>
        AuthHttp.requireRole(req, "admin") { _ =>
          val oReq = Request[IO](GET, ordersUri).withHeaders(InternalToken.header)
          val rReq = Request[IO](GET, ridersUri).withHeaders(InternalToken.header)
          (
            httpClient.expect[OrderBatch](oReq),
            httpClient.expect[RiderAdminExport](rReq)
          ).mapN((ob, re) => OrdersPanelResponse(orders = ob.orders, riders = re.riders)).flatMap(Ok(_))
        }

      case req @ GET -> Root / "api" / "delivery" / "platform-meta" =>
        AuthHttp.requireRole(req, "admin") { _ =>
          ref.get.flatMap { s =>
            Ok(
              PlatformMetaResponse(
                campaigns = s.campaigns,
                complaintTickets = s.complaintTickets,
                merchantApplications = s.merchantApplications,
                serviceAgents = s.serviceAgents,
                operationsManagers = s.operationsManagers
              )
            )
          }
        }
    }

end AdminRoutes
