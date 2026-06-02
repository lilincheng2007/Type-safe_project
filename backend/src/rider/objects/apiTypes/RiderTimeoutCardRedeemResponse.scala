package delivery.rider.objects.apiTypes

final case class RiderTimeoutCardRedeemResponse(
    ok: Boolean,
    currentEnergyPoints: Int,
    currentTimeoutCardCount: Int
)
