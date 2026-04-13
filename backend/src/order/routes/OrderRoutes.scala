package delivery.order.routes

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.http.support.AuthHttp
import delivery.order.api.CheckoutApi
import delivery.order.objects.CheckoutRequest
import delivery.order.service.OrderService
import delivery.order.utils.OrderApiSupport
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.{DeliveryState, ErrorBody}
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object OrderRoutes:

  def routes(ref: Ref[IO, DeliveryState], persist: DeliveryState => IO[Unit]): HttpRoutes[IO] =
    HttpRoutes.of[IO] {
      case req @ POST -> Root / "api" / "delivery" / "me" / "customer" / "checkout" =>
        AuthHttp.requireRole(req, "customer") { username =>
          for
            body <- req.as[CheckoutRequest]
            response <- CheckoutApi.plan(CheckoutApi.CheckoutCommand(ref, persist, username, body)).flatMap {
              case Left(OrderService.CheckoutFailure.CustomerMissing) => NotFound(OrderApiSupport.customerNotFound)
              case Left(OrderService.CheckoutFailure.Invalid(msg)) => BadRequest(ErrorBody(msg))
              case Right(output) => Ok(output)
            }
          yield response
        }
    }

end OrderRoutes
