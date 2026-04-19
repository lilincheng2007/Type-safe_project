import type { TaskIO } from '@/api/shared/TaskIO'
import type { OrdersPanelResponse } from '@/objects/admin/OrdersPanelResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchOrdersPanelIO(): TaskIO<OrdersPanelResponse> {
  return apiGetIO('/admin/orders-panel')
}
