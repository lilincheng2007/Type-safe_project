package delivery.model

/** 与前端 `frontend/src/delivery/model/order.ts` 对齐 */

final case class OrderItem(
    productId: String,
    name: String,
    unitPrice: Double,
    quantity: Int
)

final case class Order(
    id: String,
    customerId: String,
    merchantId: String,
    riderId: Option[String],
    items: List[OrderItem],
    totalAmount: Double,
    deliveryAddress: String,
    status: String,
    placedAt: String
)
