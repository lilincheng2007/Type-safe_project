package delivery.model

/** 与前端 `frontend/src/delivery/model/rider.ts` 对齐 */

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
