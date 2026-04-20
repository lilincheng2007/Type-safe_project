package delivery.rider.routes

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.rider.api.{RiderGrabOrderApi, RiderMeApi, RiderUpdateOrderStatusApi}
import delivery.rider.utils.RiderApiSupport
import delivery.shared.http.AuthHttp
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.{DeliveryState, ErrorBody, OkResponse}
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object RiderRoutes:

  def routes(ref: Ref[IO, DeliveryState], persist: DeliveryState => IO[Unit]): HttpRoutes[IO] =
    HttpRoutes.of[IO] {
      case req @ GET -> Root / "me" =>
        AuthHttp.requireRole(req, "rider") { username =>
          ref.get.flatMap(state => RiderMeApi.plan(RiderMeApi.RiderMeQuery(state, username))).flatMap {
            case None => NotFound(RiderApiSupport.riderNotFound)
            case Some(output) => Ok(output)
          }
        }

      case req @ POST -> Root / "me" / "orders" / orderId / "grab" =>
        AuthHttp.requireRole(req, "rider") { username =>
          ref.modify { current =>
            RiderGrabOrderApi.plan(RiderGrabOrderApi.RiderGrabOrderCommand(current, username, orderId)) match
              case Left(msg) => (current, Left(msg))
              case Right(output) => (output.nextState, Right(output.nextState))
          }.flatMap {
            case Left(msg) => BadRequest(ErrorBody(msg))
            case Right(nextState) => persist(nextState) *> Ok(OkResponse(ok = true))
          }
        }

      case req @ POST -> Root / "me" / "orders" / orderId / "status" =>
        AuthHttp.requireRole(req, "rider") { username =>
          ref.modify { current =>
            RiderUpdateOrderStatusApi.plan(RiderUpdateOrderStatusApi.RiderUpdateOrderStatusCommand(current, username, orderId)) match
              case Left(msg) => (current, Left(msg))
              case Right(output) => (output.nextState, Right(output))
          }.flatMap {
            case Left(msg) => BadRequest(ErrorBody(msg))
            case Right(output) => persist(output.nextState) *> Ok(output.response)
          }
        }
    }

end RiderRoutes
