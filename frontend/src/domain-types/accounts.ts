import type { Merchant, Order, Product, Rider, Voucher } from './delivery'

/** 与后端 API 返回的账号结构对齐（不含 password） */

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

export interface CustomerAccountPublic {
  role: 'customer'
  username: string
  profile: CustomerProfile
}

export interface MerchantAccountPublic {
  role: 'merchant'
  username: string
  profile: MerchantProfile
}

export interface RiderAccountPublic {
  role: 'rider'
  username: string
  profile: RiderProfile
}

export interface AdminAccountPublic {
  role: 'admin'
  username: string
  displayName: string
}
