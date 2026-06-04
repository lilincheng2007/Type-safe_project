package delivery.order.objects.apiTypes

import delivery.order.objects.OrderChatMessage

final case class OrderChatMessagesResponse(messages: List[OrderChatMessage])
