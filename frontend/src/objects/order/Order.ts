import type { MerchantId, OrderId, RiderId, UserId, OrderStatus } from '@/delivery/model/ids'
import type { OrderItem } from './OrderItem'

export interface Order {
  id: OrderId
  customerId: UserId
  merchantId: MerchantId
  riderId?: RiderId
  items: OrderItem[]
  totalAmount: number
  deliveryAddress: string
  status: OrderStatus
  placedAt: string
}
