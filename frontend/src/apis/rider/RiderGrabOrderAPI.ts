import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OrderId } from '@/objects/shared/ids'
import type { OkResponse } from '@/objects/shared/apiTypes/OkResponse'

class RiderGrabOrderAPI extends APIMessage<OkResponse> {
  readonly apiName = 'ridergraborderapi'
  readonly orderId: OrderId

  constructor(orderId: OrderId) {
    super()
    this.orderId = orderId
  }
}

export function grabRiderOrderIO(orderId: OrderId): TaskIO<OkResponse> {
  return sendAPI(new RiderGrabOrderAPI(orderId))
}
