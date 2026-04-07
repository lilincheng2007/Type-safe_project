/** 与后端 `Profiles.scala` 对齐 */

import type { Merchant, Product } from './catalog'
import type { Order } from './order'
import type { Rider } from './rider'
import type { Voucher } from './voucher'

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

export interface MerchantStoreProfile {
  merchant: Merchant
  products: Product[]
  pendingOrders: Order[]
  historyOrders: Order[]
}

export interface MerchantProfile {
  id: string
  ownerName: string
  phone: string
  stores: MerchantStoreProfile[]
}

export interface RiderProfile {
  rider: Rider
  walletBalance: number
  pendingOrders: Order[]
  historyOrders: Order[]
}
