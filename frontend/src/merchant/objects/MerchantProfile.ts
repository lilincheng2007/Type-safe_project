import type { MerchantStoreProfile } from './MerchantStoreProfile'

export interface MerchantProfile {
  id: string
  ownerName: string
  phone: string
  stores: MerchantStoreProfile[]
}
