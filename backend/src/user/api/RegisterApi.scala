package delivery.user.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.{DeliveryState, ErrorBody, OkResponse}
import delivery.store.{MerchantDomainOps, RiderDomainOps, UserDomainOps}
import delivery.user.objects.RegisterRequest
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object RegisterApi:

  def routes(ref: Ref[IO, DeliveryState], persist: DeliveryState => IO[Unit]): HttpRoutes[IO] =
    HttpRoutes.of[IO] {
      case req @ POST -> Root / "api" / "auth" / "register" =>
        for
          body <- req.as[RegisterRequest]
          current <- ref.get
          resp <- body.role match
            case "admin" =>
              BadRequest(ErrorBody("不可注册管理员"))
            case "customer" =>
              UserDomainOps.registerCustomer(current.user, body.username, body.password) match
                case Left(msg) => BadRequest(ErrorBody(msg))
                case Right(nextUser) =>
                  val next = current.copy(user = nextUser)
                  ref.set(next) *> persist(next) *> Ok(OkResponse(ok = true))
            case "merchant" =>
              UserDomainOps.registerMerchantCredential(current.user, body.username, body.password) match
                case Left(msg) => BadRequest(ErrorBody(msg))
                case Right(nextUser) =>
                  MerchantDomainOps.bootstrapMerchant(current.merchant, body.username) match
                    case Left(msg) => BadRequest(ErrorBody(msg))
                    case Right(nextMerchant) =>
                      val next = current.copy(user = nextUser, merchant = nextMerchant)
                      ref.set(next) *> persist(next) *> Ok(OkResponse(ok = true))
            case "rider" =>
              UserDomainOps.registerRiderCredential(current.user, body.username, body.password) match
                case Left(msg) => BadRequest(ErrorBody(msg))
                case Right(nextUser) =>
                  RiderDomainOps.bootstrapRider(current.rider, body.username) match
                    case Left(msg) => BadRequest(ErrorBody(msg))
                    case Right(nextRider) =>
                      val next = current.copy(user = nextUser, rider = nextRider)
                      ref.set(next) *> persist(next) *> Ok(OkResponse(ok = true))
            case _ =>
              BadRequest(ErrorBody("无效角色"))
        yield resp
    }

end RegisterApi
