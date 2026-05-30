package delivery.rider.objects

import delivery.shared.objects.{RiderId, RiderStatus}

final case class Rider(
    id: RiderId,
    name: String,
    phone: String,
    realtimeLocation: String,
    status: RiderStatus,
    totalOrders: Int,
    rating: Double,
    station: String,
    salary: Double
)
