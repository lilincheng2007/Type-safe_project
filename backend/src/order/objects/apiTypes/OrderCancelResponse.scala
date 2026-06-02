package delivery.order.objects.apiTypes

import delivery.order.objects.Order

final case class OrderCancelResponse(order: Order, walletBalance: Double)
