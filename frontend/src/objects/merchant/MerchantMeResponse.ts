import { UserRoles } from '@/objects/shared/ids'
import type { UserRole } from '@/objects/shared/ids'
import type { MerchantAccountPublic } from './MerchantAccountPublic'

export interface MerchantMeResponse {
  username: string
  role: typeof UserRoles.merchant & UserRole
  merchantAccount: MerchantAccountPublic
}
