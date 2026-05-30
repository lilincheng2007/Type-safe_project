import { APIMessage } from '@/api/shared/APIMessage'
import type { TaskIO } from '@/api/shared/TaskIO'
import { sendAPI } from '@/api/shared/sendAPI'
import type { OrderId } from '@/objects/shared/ids'
import type { OkResponse } from '@/objects/shared/OkResponse'

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
