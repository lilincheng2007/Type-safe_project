package delivery.rider.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.rider.objects.RiderMeResponse
import delivery.rider.service.RiderService
import delivery.shared.objects.DeliveryState

object RiderMeApi extends ApiPlan[RiderMeApi.RiderMeQuery, Option[RiderMeResponse]]:

  final case class RiderMeQuery(ref: Ref[IO, DeliveryState], username: String)

  override val name: String = "RiderMeApi"

  override def plan(input: RiderMeApi.RiderMeQuery): IO[Option[RiderMeResponse]] =
    RiderService.fetchRiderMe(input.ref, input.username)

end RiderMeApi
