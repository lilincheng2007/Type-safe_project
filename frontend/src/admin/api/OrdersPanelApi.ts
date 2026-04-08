import type { TaskIO } from '@/delivery/io/TaskIO'
import type { OrdersPanelResponse } from '../objects/OrdersPanelResponse'
import { apiGetIO } from '@/shared/http/client'

export function fetchOrdersPanelIO(): TaskIO<OrdersPanelResponse> {
  return apiGetIO('/delivery/orders-panel')
}
