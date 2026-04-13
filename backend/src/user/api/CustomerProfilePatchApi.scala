package delivery.user.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.shared.objects.{DeliveryState, OkResponse}
import delivery.user.objects.CustomerProfilePatch
import delivery.user.service.UserService

object CustomerProfilePatchApi
    extends ApiPlan[CustomerProfilePatchApi.CustomerProfilePatchCommand, Either[String, OkResponse]]:

  final case class CustomerProfilePatchCommand(
      ref: Ref[IO, DeliveryState],
      persist: DeliveryState => IO[Unit],
      username: String,
      body: CustomerProfilePatch
  )

  override val name: String = "CustomerProfilePatchApi"

  override def plan(input: CustomerProfilePatchApi.CustomerProfilePatchCommand): IO[Either[String, OkResponse]] =
    UserService.patchCustomerProfile(input.ref, input.persist, input.username, input.body)

end CustomerProfilePatchApi
