package delivery.user.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.auth.JwtSupport
import delivery.http.support.AuthHttp
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.DeliveryState
import delivery.user.objects.{LoginRequest, LoginResponse}
import delivery.store.UserDomainOps
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object LoginApi:

  def routes(ref: Ref[IO, DeliveryState]): HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ POST -> Root / "api" / "auth" / "login" =>
      for
        body <- req.as[LoginRequest]
        state <- ref.get
        resp <- UserDomainOps.verifyLogin(state.user, body.role, body.username, body.password) match
          case Left(msg) => AuthHttp.unauthorizedJson(msg)
          case Right(()) =>
            Ok(LoginResponse(JwtSupport.signToken(body.username, body.role), body.username, body.role))
      yield resp
  }

end LoginApi
