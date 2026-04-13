package delivery.order.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.order.objects.{CheckoutRequest, CheckoutResponse}
import delivery.order.service.OrderService
import delivery.shared.objects.DeliveryState

object CheckoutApi extends ApiPlan[CheckoutApi.CheckoutCommand, Either[OrderService.CheckoutFailure, CheckoutResponse]]:

  final case class CheckoutCommand(
      ref: Ref[IO, DeliveryState],
      persist: DeliveryState => IO[Unit],
      username: String,
      body: CheckoutRequest
  )

  override val name: String = "CheckoutApi"

  override def plan(input: CheckoutApi.CheckoutCommand): IO[Either[OrderService.CheckoutFailure, CheckoutResponse]] =
    OrderService.checkout(input.ref, input.persist, input.username, input.body)

end CheckoutApi
