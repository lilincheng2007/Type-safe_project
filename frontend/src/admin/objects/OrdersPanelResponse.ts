import type { Order } from '@/order/objects/Order'
import type { Rider } from '@/rider/objects/Rider'

export interface OrdersPanelResponse {
  orders: Order[]
  riders: Rider[]
}
