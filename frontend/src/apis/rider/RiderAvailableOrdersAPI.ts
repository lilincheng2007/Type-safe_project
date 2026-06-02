import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { RiderAvailableOrdersResponse } from '@/objects/rider/apiTypes/RiderAvailableOrdersResponse'

class RiderAvailableOrdersAPI extends APIMessage<RiderAvailableOrdersResponse> {
  readonly apiName = 'rideravailableordersapi'
}

export function fetchRiderAvailableOrdersIO(): TaskIO<RiderAvailableOrdersResponse> {
  return sendAPI(new RiderAvailableOrdersAPI())
}
