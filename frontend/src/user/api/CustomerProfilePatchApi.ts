import type { TaskIO } from '@/delivery/io/TaskIO'
import type { CustomerProfilePatch } from '../objects/CustomerProfilePatch'
import type { OkResponse } from '@/shared/objects/OkResponse'
import { apiPatchIO } from '@/shared/http/client'

export function patchCustomerProfileIO(patch: CustomerProfilePatch): TaskIO<OkResponse> {
  return apiPatchIO('/delivery/me/customer/profile', patch)
}
