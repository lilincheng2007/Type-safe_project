import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { CustomerProfilePatch } from '@/objects/user/CustomerProfilePatch'
import type { OkResponse } from '@/objects/shared/apiTypes/OkResponse'

class CustomerProfilePatchAPI extends APIMessage<OkResponse> {
  readonly apiName = 'customerprofilepatchapi'
  readonly patch: CustomerProfilePatch

  constructor(patch: CustomerProfilePatch) {
    super()
    this.patch = patch
  }
}

export function patchCustomerProfileIO(patch: CustomerProfilePatch): TaskIO<OkResponse> {
  return sendAPI(new CustomerProfilePatchAPI(patch))
}
