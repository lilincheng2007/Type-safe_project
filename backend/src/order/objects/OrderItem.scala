package delivery.order.objects

import delivery.shared.objects.ProductId

final case class OrderItem(
    productId: ProductId,
    name: String,
    unitPrice: Double,
    quantity: Int
)
