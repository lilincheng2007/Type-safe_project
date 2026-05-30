import { APIMessage } from '@/api/shared/APIMessage'
import type { TaskIO } from '@/api/shared/TaskIO'
import { sendAPI } from '@/api/shared/sendAPI'
import type { RiderAvailableOrdersResponse } from '@/objects/rider/RiderAvailableOrdersResponse'

class RiderAvailableOrdersAPI extends APIMessage<RiderAvailableOrdersResponse> {
  readonly apiName = 'rideravailableordersapi'
}

export function fetchRiderAvailableOrdersIO(): TaskIO<RiderAvailableOrdersResponse> {
  return sendAPI(new RiderAvailableOrdersAPI())
}
