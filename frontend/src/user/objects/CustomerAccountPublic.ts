import type { CustomerProfile } from './CustomerProfile'

export interface CustomerAccountPublic {
  role: 'customer'
  username: string
  profile: CustomerProfile
}
