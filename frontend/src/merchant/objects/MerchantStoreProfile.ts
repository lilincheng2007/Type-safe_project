import type { Merchant } from './Merchant'
import type { Product } from './Product'
import type { Order } from '@/order/objects/Order'

export interface MerchantStoreProfile {
  merchant: Merchant
  products: Product[]
  pendingOrders: Order[]
  historyOrders: Order[]
}
