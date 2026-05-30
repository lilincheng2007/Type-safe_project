import { UserRoles } from '@/objects/shared/ids'
import type { UserRole } from '@/objects/shared/ids'
import type { CustomerProfile } from './CustomerProfile'

export interface CustomerAccountPublic {
  role: typeof UserRoles.customer & UserRole
  username: string
  profile: CustomerProfile
}
