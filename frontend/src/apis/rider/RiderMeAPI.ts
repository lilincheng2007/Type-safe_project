import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { RiderMeResponse } from '@/objects/rider/apiTypes/RiderMeResponse'

class RiderMeAPI extends APIMessage<RiderMeResponse> {
  readonly apiName = 'ridermeapi'
}

export function fetchRiderMeIO(): TaskIO<RiderMeResponse> {
  return sendAPI(new RiderMeAPI())
}
