package delivery.order.objects

import delivery.shared.objects.OrderId

final case class OrderChatUnreadCount(orderId: OrderId, peerRole: String, unreadCount: Int)
