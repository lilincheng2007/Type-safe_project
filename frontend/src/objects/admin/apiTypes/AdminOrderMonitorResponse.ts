import type { Order } from '@/objects/order/Order'

export interface AdminOrderMonitorItem {
  order: Order
  reason: string
  elapsedMinutes: number
}

export interface AdminOrderMonitorResponse {
  todayOrderCount: number
  todayTurnover: number
  pendingRefunds: AdminOrderMonitorItem[]
  abnormalOrders: AdminOrderMonitorItem[]
  merchantTimeoutOrders: AdminOrderMonitorItem[]
  riderTimeoutOrders: AdminOrderMonitorItem[]
}
