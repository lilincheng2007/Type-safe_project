import type { Order } from '@/objects/order'

export interface RiderUpdateOrderStatusResponse {
  ok: boolean
  order: Order
}
