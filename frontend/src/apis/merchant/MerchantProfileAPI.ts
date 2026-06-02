import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { MerchantProfile } from '@/objects/merchant/MerchantProfile'
import type { OkResponse } from '@/objects/shared/apiTypes/OkResponse'

class MerchantProfileAPI extends APIMessage<OkResponse> {
  readonly apiName = 'merchantprofileapi'
  readonly profile: MerchantProfile

  constructor(profile: MerchantProfile) {
    super()
    this.profile = profile
  }
}

export function putMerchantProfileIO(profile: MerchantProfile): TaskIO<OkResponse> {
  return sendAPI(new MerchantProfileAPI(profile))
}
