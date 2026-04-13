import type { Order } from './Order'

export interface CheckoutResponse {
  orders: Order[]
  walletBalance: number
}
