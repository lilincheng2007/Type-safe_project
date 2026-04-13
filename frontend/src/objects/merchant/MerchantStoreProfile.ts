import type { Merchant } from './Merchant'
import type { Product } from './Product'
import type { Order } from '@/objects/order/Order'

export interface MerchantStoreProfile {
  merchant: Merchant
  products: Product[]
  pendingOrders: Order[]
  historyOrders: Order[]
}
