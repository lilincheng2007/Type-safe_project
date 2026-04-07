/** 与后端 `OrderModels.scala` 对齐 */

import type { MerchantId, OrderId, ProductId, UserId, RiderId, OrderStatus } from './ids'

export interface OrderItem {
  productId: ProductId
  name: string
  unitPrice: number
  quantity: number
}

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
