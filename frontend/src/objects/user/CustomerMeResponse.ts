import { UserRoles } from '@/objects/shared/ids'
import type { UserRole } from '@/objects/shared/ids'
import type { CustomerAccountPublic } from './CustomerAccountPublic'

export interface CustomerMeResponse {
  username: string
  role: typeof UserRoles.customer & UserRole
  customerAccount: CustomerAccountPublic
}
