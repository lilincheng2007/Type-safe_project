package delivery.rider.state

import delivery.rider.objects.Rider

final case class RiderServiceState(
    riders: List[Rider],
    riderAccounts: List[RiderAccount]
)
