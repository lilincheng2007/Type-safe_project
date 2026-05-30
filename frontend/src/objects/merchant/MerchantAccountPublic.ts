import { UserRoles } from '@/objects/shared/ids'
import type { UserRole } from '@/objects/shared/ids'
import type { MerchantProfile } from './MerchantProfile'

export interface MerchantAccountPublic {
  role: typeof UserRoles.merchant & UserRole
  username: string
  profile: MerchantProfile
}
