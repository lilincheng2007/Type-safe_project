package delivery.rider.objects

import delivery.order.objects.Order

final case class RiderProfile(
    rider: Rider,
    walletBalance: Double,
    pendingOrders: List[Order],
    historyOrders: List[Order]
)
