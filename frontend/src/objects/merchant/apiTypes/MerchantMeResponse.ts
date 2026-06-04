import { UserRoles } from '@/objects/shared/ids'
import type { UserRole } from '@/objects/shared/ids'
import type { StoreOnboardingRequest } from '@/objects/admin/StoreOnboardingRequest'
import type { MerchantAccountPublic } from '../MerchantAccountPublic'

export interface MerchantMeResponse {
  username: string
  role: typeof UserRoles.merchant & UserRole
  merchantAccount: MerchantAccountPublic
  onboardingRequests?: StoreOnboardingRequest[]
}
