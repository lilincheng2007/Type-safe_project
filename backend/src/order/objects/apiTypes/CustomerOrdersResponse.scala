package delivery.order.objects.apiTypes

import delivery.order.objects.Order

final case class CustomerOrdersResponse(pendingOrders: List[Order], historyOrders: List[Order])
