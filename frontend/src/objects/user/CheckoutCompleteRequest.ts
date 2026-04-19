import type { Order } from '../order/Order'

export interface CheckoutCompleteRequest {
  username: string
  orders: Order[]
  totalDebit: number
}
