package delivery.user.routes

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.http.support.AuthHttp
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.{DeliveryState, ErrorBody}
import delivery.user.api.*
import delivery.user.objects.{CustomerProfilePatch, LoginRequest, RegisterRequest}
import delivery.user.utils.UserApiSupport
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object UserRoutes:

  def routes(ref: Ref[IO, DeliveryState], persist: DeliveryState => IO[Unit]): HttpRoutes[IO] =
    HttpRoutes.of[IO] {
      case req @ POST -> Root / "api" / "auth" / "login" =>
        for
          body <- req.as[LoginRequest]
          response <- LoginApi.plan(LoginApi.LoginCommand(ref, body)).flatMap {
            case Left(msg) => AuthHttp.unauthorizedJson(msg)
            case Right(output) => Ok(output)
          }
        yield response

      case req @ POST -> Root / "api" / "auth" / "register" =>
        for
          body <- req.as[RegisterRequest]
          response <- RegisterApi.plan(RegisterApi.RegisterCommand(ref, persist, body)).flatMap {
            case Left(msg) if msg == UserApiSupport.invalidRole.error => BadRequest(UserApiSupport.invalidRole)
            case Left(msg) => BadRequest(ErrorBody(msg))
            case Right(output) => Ok(output)
          }
        yield response

      case req @ GET -> Root / "api" / "auth" / "me" =>
        AuthHttp.requireRole(req, "customer") { username =>
          CustomerMeApi.plan(CustomerMeApi.CustomerMeQuery(ref, username)).flatMap {
            case None => NotFound(UserApiSupport.customerNotFound)
            case Some(output) => Ok(output)
          }
        }

      case req @ PATCH -> Root / "api" / "delivery" / "me" / "customer" / "profile" =>
        AuthHttp.requireRole(req, "customer") { username =>
          for
            body <- req.as[CustomerProfilePatch]
            response <- CustomerProfilePatchApi
              .plan(CustomerProfilePatchApi.CustomerProfilePatchCommand(ref, persist, username, body))
              .flatMap {
                case Left(msg) => BadRequest(ErrorBody(msg))
                case Right(output) => Ok(output)
              }
          yield response
        }
    }

end UserRoutes
