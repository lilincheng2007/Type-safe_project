/** 与后端 `ApiDto` 中公开账号类型及概念上的账户视图对齐（不含 password） */

import type { CustomerProfile, MerchantProfile, RiderProfile } from './profiles'

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
