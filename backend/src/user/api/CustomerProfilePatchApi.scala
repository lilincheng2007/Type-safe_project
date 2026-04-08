package delivery.user.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.http.support.AuthHttp
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.{DeliveryState, ErrorBody, OkResponse}
import delivery.store.UserDomainOps
import delivery.user.objects.CustomerProfilePatch
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object CustomerProfilePatchApi:

  def routes(ref: Ref[IO, DeliveryState], persist: DeliveryState => IO[Unit]): HttpRoutes[IO] =
    HttpRoutes.of[IO] {
      case req @ PATCH -> Root / "api" / "delivery" / "me" / "customer" / "profile" =>
        AuthHttp.requireRole(req, "customer") { username =>
          for
            patch <- req.as[CustomerProfilePatch]
            current <- ref.get
            resp <- UserDomainOps.patchCustomer(
              current.user,
              username,
              delivery.model.CustomerProfilePatch(
                walletBalance = patch.walletBalance,
                defaultAddress = patch.defaultAddress,
                name = patch.name,
                phone = patch.phone
              )
            ) match
              case Left(msg) => BadRequest(ErrorBody(msg))
              case Right(nextUser) =>
                val next = current.copy(user = nextUser)
                ref.set(next) *> persist(next) *> Ok(OkResponse(ok = true))
          yield resp
        }
    }

end CustomerProfilePatchApi
