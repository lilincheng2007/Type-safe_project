import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { MerchantMeResponse } from '@/objects/merchant/apiTypes/MerchantMeResponse'

class MerchantMeAPI extends APIMessage<MerchantMeResponse> {
  readonly apiName = 'merchantmeapi'
}

export function fetchMerchantMeIO(): TaskIO<MerchantMeResponse> {
  return sendAPI(new MerchantMeAPI())
}
