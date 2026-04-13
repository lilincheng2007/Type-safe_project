package delivery.user.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.shared.objects.{DeliveryState, OkResponse}
import delivery.user.objects.RegisterRequest
import delivery.user.service.UserService
import org.typelevel.log4cats.slf4j.Slf4jLogger

object RegisterApi extends ApiPlan[RegisterApi.RegisterCommand, Either[String, OkResponse]]:

  final case class RegisterCommand(ref: Ref[IO, DeliveryState], persist: DeliveryState => IO[Unit], body: RegisterRequest)

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "RegisterApi"

  override def plan(input: RegisterApi.RegisterCommand): IO[Either[String, OkResponse]] =
    for
      _ <- logger.info(s"$name started, username=${input.body.username}")
      response <- UserService.register(input.ref, input.persist, input.body)
      _ <- logger.info(s"$name finished, success=${response.isRight}")
    yield response

end RegisterApi
