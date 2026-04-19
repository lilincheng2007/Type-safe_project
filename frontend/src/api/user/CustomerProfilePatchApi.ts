import type { TaskIO } from '@/api/shared/TaskIO'
import type { CustomerProfilePatch } from '@/objects/user/CustomerProfilePatch'
import type { OkResponse } from '@/objects/shared/OkResponse'
import { apiPatchIO } from '@/api/shared/client'

export function patchCustomerProfileIO(patch: CustomerProfilePatch): TaskIO<OkResponse> {
  return apiPatchIO('/user/me/profile', patch)
}
