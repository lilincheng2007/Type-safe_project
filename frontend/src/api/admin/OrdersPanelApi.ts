import type { TaskIO } from '@/delivery/io/TaskIO'
import type { OrdersPanelResponse } from '@/objects/admin/OrdersPanelResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchOrdersPanelIO(): TaskIO<OrdersPanelResponse> {
  return apiGetIO('/delivery/orders-panel')
}
