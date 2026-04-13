package delivery.user.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.shared.objects.{DeliveryState, OkResponse}
import delivery.user.objects.RegisterRequest
import delivery.user.service.UserService

object RegisterApi extends ApiPlan[RegisterApi.RegisterCommand, Either[String, OkResponse]]:

  final case class RegisterCommand(ref: Ref[IO, DeliveryState], persist: DeliveryState => IO[Unit], body: RegisterRequest)

  override val name: String = "RegisterApi"

  override def plan(input: RegisterApi.RegisterCommand): IO[Either[String, OkResponse]] =
    UserService.register(input.ref, input.persist, input.body)

end RegisterApi
