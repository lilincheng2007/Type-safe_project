package orderservice

import cats.effect.IO
import cats.effect.kernel.Ref
import cats.syntax.all.*
import delivery.http.support.AuthHttp
import delivery.interop.InternalToken
import delivery.model.*
import delivery.model.JsonCodecs.given
import delivery.store.OrderDomainOps
import io.circe.Json
import org.http4s.*
import org.http4s.Method.{GET, POST}
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.client.Client
import org.http4s.dsl.io.*

object OrderRoutes:

  def apply(
      httpClient: Client[IO],
      ref: Ref[IO, OrderServiceState],
      persist: OrderServiceState => IO[Unit],
      userBaseUrl: String,
      merchantBaseUrl: String
  ): HttpRoutes[IO] =
    val catalogUri = Uri.unsafeFromString(s"${merchantBaseUrl.stripSuffix("/")}/api/delivery/catalog")

    def profileUri(username: String): Uri =
      Uri.unsafeFromString(s"${userBaseUrl.stripSuffix("/")}/internal/customer-profile/$username")

    val completeUri = Uri.unsafeFromString(s"${userBaseUrl.stripSuffix("/")}/internal/checkout-complete")
    val attachUri = Uri.unsafeFromString(s"${merchantBaseUrl.stripSuffix("/")}/internal/attach-orders")

    val public = HttpRoutes.of[IO] {
      case GET -> Root =>
        Ok(Json.obj("service" -> Json.fromString("order-service")))

      case GET -> Root / "api" / "health" =>
        Ok(JsonCodecs.HealthOk(true))

      case req @ POST -> Root / "api" / "delivery" / "me" / "customer" / "checkout" =>
        AuthHttp.requireRole(req, "customer") { username =>
          req.as[CheckoutRequest].flatMap { body =>
            httpClient.expect[CatalogResponse](Request[IO](GET, catalogUri)).flatMap { catalog =>
              val profileReq =
                Request[IO](GET, profileUri(username)).withHeaders(InternalToken.header)
              httpClient.run(profileReq).use { r =>
                if !r.status.isSuccess then BadRequest(ErrorBody("无法读取用户资料"))
                else
                  r.as[CustomerProfile].flatMap { profile =>
                    ref.get.flatMap { st =>
                      OrderDomainOps.buildOrdersForCheckout(catalog.products, profile, body.lines) match
                        case Left(msg) => BadRequest(ErrorBody(msg))
                        case Right((orders, totalDebit)) =>
                          val completeReq =
                            Request[IO](POST, completeUri)
                              .withHeaders(InternalToken.header)
                              .withEntity(CheckoutCompleteRequest(username, orders, totalDebit))
                          httpClient.run(completeReq).use { cr =>
                            if !cr.status.isSuccess then BadRequest(ErrorBody("用户服务扣款失败"))
                            else
                              val attachReq =
                                Request[IO](POST, attachUri)
                                  .withHeaders(InternalToken.header)
                                  .withEntity(AttachOrdersRequest(orders))
                              httpClient.run(attachReq).use { ar =>
                                if !ar.status.isSuccess then BadRequest(ErrorBody("商户服务同步订单失败"))
                                else
                                  val ns = OrderDomainOps.appendOrders(st, orders)
                                  val pReq =
                                    Request[IO](GET, profileUri(username)).withHeaders(InternalToken.header)
                                  httpClient.run(pReq).use { pr =>
                                    val walletIO =
                                      if pr.status.isSuccess then pr.as[CustomerProfile].map(_.walletBalance)
                                      else IO.pure(profile.walletBalance - totalDebit)
                                    walletIO.flatMap { w =>
                                      ref.set(ns) *> persist(ns) *> Ok(CheckoutResponse(orders, w))
                                    }
                                  }
                              }
                          }
                    }
                  }
              }
            }
          }
        }
    }

    val internal = HttpRoutes.of[IO] {
      case req @ GET -> Root / "internal" / "orders" =>
        if !InternalToken.authorize(req) then Forbidden(ErrorBody("内部调用拒绝"))
        else ref.get.flatMap(s => Ok(OrderBatch(s.orders)))
    }

    public <+> internal

end OrderRoutes
