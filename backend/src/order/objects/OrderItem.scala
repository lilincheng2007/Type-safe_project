package delivery.order.objects

final case class OrderItem(
    productId: String,
    name: String,
    unitPrice: Double,
    quantity: Int
)
