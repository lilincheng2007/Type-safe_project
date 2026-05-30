package delivery.order.objects

import delivery.shared.objects.{MerchantId, OrderId, OrderStatus, RiderId, UserId}

final case class Order(
    id: OrderId,
    customerId: UserId,
    customerName: String,
    customerPhone: String,
    merchantId: MerchantId,
    riderId: Option[RiderId],
    items: List[OrderItem],
    totalAmount: Double,
    deliveryAddress: String,
    status: OrderStatus,
    placedAt: String
)
