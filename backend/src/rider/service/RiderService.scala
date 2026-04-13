package delivery.rider.service

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.rider.objects.RiderMeResponse
import delivery.rider.repository.RiderRepository
import delivery.rider.utils.RiderApiSupport
import delivery.shared.objects.DeliveryState

object RiderService:

  def fetchRiderMe(ref: Ref[IO, DeliveryState], username: String): IO[Option[RiderMeResponse]] =
    ref.get.map { state =>
      RiderRepository.findRiderAccount(state, username).map(account => RiderApiSupport.riderMeResponse(username, account))
    }

end RiderService
