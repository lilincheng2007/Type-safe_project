package delivery.admin.objects.apiTypes

import delivery.order.objects.Order

final case class AdminRefundRequestsResponse(requests: List[Order])
