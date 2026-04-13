package delivery.order.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.order.objects.{CheckoutRequest, CheckoutResponse}
import delivery.order.service.OrderService
import delivery.shared.objects.DeliveryState
import org.typelevel.log4cats.slf4j.Slf4jLogger

object CheckoutApi extends ApiPlan[CheckoutApi.CheckoutCommand, Either[OrderService.CheckoutFailure, CheckoutResponse]]:

  final case class CheckoutCommand(
      ref: Ref[IO, DeliveryState],
      persist: DeliveryState => IO[Unit],
      username: String,
      body: CheckoutRequest
  )

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "CheckoutApi"

  override def plan(input: CheckoutApi.CheckoutCommand): IO[Either[OrderService.CheckoutFailure, CheckoutResponse]] =
    for
      _ <- logger.info(s"$name started, username=${input.username}")
      response <- OrderService.checkout(input.ref, input.persist, input.username, input.body)
      _ <- logger.info(s"$name finished, success=${response.isRight}")
    yield response

end CheckoutApi
