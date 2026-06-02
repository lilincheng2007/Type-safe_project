package delivery.rider.objects.apiTypes

import delivery.shared.objects.OrderId

final case class RiderUseTimeoutCardResponse(
    ok: Boolean,
    orderId: OrderId,
    currentTimeoutCardCount: Int,
    timeoutExempted: Boolean
)
