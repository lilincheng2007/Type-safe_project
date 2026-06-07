package delivery.admin.objects.apiTypes

import delivery.order.objects.Order

final case class AdminOrderMonitorItem(
    order: Order,
    reason: String,
    elapsedMinutes: Int
)

final case class AdminOrderMonitorResponse(
    todayOrderCount: Int,
    todayTurnover: Double,
    pendingRefunds: List[AdminOrderMonitorItem],
    abnormalOrders: List[AdminOrderMonitorItem],
    merchantTimeoutOrders: List[AdminOrderMonitorItem],
    riderTimeoutOrders: List[AdminOrderMonitorItem]
)
