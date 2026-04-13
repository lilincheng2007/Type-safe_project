package delivery.user.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.shared.objects.DeliveryState
import delivery.user.objects.{LoginRequest, LoginResponse}
import delivery.user.service.UserService

object LoginApi extends ApiPlan[LoginApi.LoginCommand, Either[String, LoginResponse]]:

  final case class LoginCommand(ref: Ref[IO, DeliveryState], body: LoginRequest)

  override val name: String = "LoginApi"

  override def plan(input: LoginApi.LoginCommand): IO[Either[String, LoginResponse]] =
    UserService.login(input.ref, input.body)

end LoginApi
