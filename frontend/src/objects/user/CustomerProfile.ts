import type { Order } from '@/objects/order/Order'
import type { Voucher } from '@/delivery/model/voucher'

export interface CustomerProfile {
  id: string
  name: string
  phone: string
  defaultAddress: string
  vouchers: Voucher[]
  walletBalance: number
  pendingOrders: Order[]
  historyOrders: Order[]
}
