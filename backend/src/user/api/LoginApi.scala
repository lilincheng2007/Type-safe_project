package delivery.user.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.shared.objects.DeliveryState
import delivery.user.objects.{LoginRequest, LoginResponse}
import delivery.user.service.UserService
import org.typelevel.log4cats.slf4j.Slf4jLogger

object LoginApi extends ApiPlan[LoginApi.LoginCommand, Either[String, LoginResponse]]:

  final case class LoginCommand(ref: Ref[IO, DeliveryState], body: LoginRequest)

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "LoginApi"

  override def plan(input: LoginApi.LoginCommand): IO[Either[String, LoginResponse]] =
    for
      _ <- logger.info(s"$name started, username=${input.body.username}")
      response <- UserService.login(input.ref, input.body)
      _ <- logger.info(s"$name finished, success=${response.isRight}")
    yield response

end LoginApi
