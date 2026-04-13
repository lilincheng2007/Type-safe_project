import type { TaskIO } from '@/delivery/io/TaskIO'
import type { CustomerProfilePatch } from '@/objects/user/CustomerProfilePatch'
import type { OkResponse } from '@/objects/shared/OkResponse'
import { apiPatchIO } from '@/api/shared/client'

export function patchCustomerProfileIO(patch: CustomerProfilePatch): TaskIO<OkResponse> {
  return apiPatchIO('/delivery/me/customer/profile', patch)
}
