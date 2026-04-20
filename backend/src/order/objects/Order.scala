package delivery.order.objects

final case class Order(
    id: String,
    customerId: String,
    customerName: String,
    customerPhone: String,
    merchantId: String,
    riderId: Option[String],
    items: List[OrderItem],
    totalAmount: Double,
    deliveryAddress: String,
    status: String,
    placedAt: String
)
