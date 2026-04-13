package delivery.user.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.shared.objects.DeliveryState
import delivery.user.objects.CustomerMeResponse
import delivery.user.service.UserService

object CustomerMeApi extends ApiPlan[CustomerMeApi.CustomerMeQuery, Option[CustomerMeResponse]]:

  final case class CustomerMeQuery(ref: Ref[IO, DeliveryState], username: String)

  override val name: String = "CustomerMeApi"

  override def plan(input: CustomerMeApi.CustomerMeQuery): IO[Option[CustomerMeResponse]] =
    UserService.fetchCustomerMe(input.ref, input.username)

end CustomerMeApi
