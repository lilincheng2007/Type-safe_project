import type { Order } from '@/order/objects/Order'
import type { Rider } from './Rider'

export interface RiderProfile {
  rider: Rider
  walletBalance: number
  pendingOrders: Order[]
  historyOrders: Order[]
}
