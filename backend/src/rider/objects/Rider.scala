package delivery.rider.objects

final case class Rider(
    id: String,
    name: String,
    phone: String,
    realtimeLocation: String,
    status: String,
    totalOrders: Int,
    rating: Double,
    station: String,
    salary: Double
)
