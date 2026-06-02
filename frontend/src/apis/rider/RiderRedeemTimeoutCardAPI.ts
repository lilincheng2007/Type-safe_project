import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { RiderTimeoutCardRedeemResponse } from '@/objects/rider/apiTypes/RiderTimeoutCardRedeemResponse'

class RiderRedeemTimeoutCardAPI extends APIMessage<RiderTimeoutCardRedeemResponse> {
  readonly apiName = 'riderredeemtimeoutcardapi'
}

export function redeemRiderTimeoutCardIO(): TaskIO<RiderTimeoutCardRedeemResponse> {
  return sendAPI(new RiderRedeemTimeoutCardAPI())
}
