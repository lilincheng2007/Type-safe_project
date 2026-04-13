import type { Order } from '@/objects/order/Order'
import type { Rider } from './Rider'

export interface RiderProfile {
  rider: Rider
  walletBalance: number
  pendingOrders: Order[]
  historyOrders: Order[]
}
