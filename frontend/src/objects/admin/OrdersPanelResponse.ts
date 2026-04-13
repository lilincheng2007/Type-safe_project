import type { Order } from '@/objects/order/Order'
import type { Rider } from '@/objects/rider/Rider'

export interface OrdersPanelResponse {
  orders: Order[]
  riders: Rider[]
}
