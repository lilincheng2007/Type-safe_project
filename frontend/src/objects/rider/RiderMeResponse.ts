import type { Order } from '@/objects/order'
import type { RiderAccountPublic } from './RiderAccountPublic'

export interface RiderMeResponse {
  username: string
  role: 'rider'
  riderAccount: RiderAccountPublic
  availableOrders: Order[]
}
