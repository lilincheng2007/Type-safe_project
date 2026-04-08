import type { MerchantProfile } from './MerchantProfile'

export interface MerchantAccountPublic {
  role: 'merchant'
  username: string
  profile: MerchantProfile
}
