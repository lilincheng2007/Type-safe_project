import { APIMessage } from '@/api/shared/APIMessage'
import type { TaskIO } from '@/api/shared/TaskIO'
import { sendAPI } from '@/api/shared/sendAPI'
import type { OrderId, OrderStatus } from '@/objects/shared/ids'
import type { OkResponse } from '@/objects/shared/OkResponse'

class RiderUpdateOrderStatusAPI extends APIMessage<OkResponse> {
  readonly apiName = 'riderupdateorderstatusapi'
  readonly orderId: OrderId
  readonly targetStatus: OrderStatus

  constructor(orderId: OrderId, targetStatus: OrderStatus) {
    super()
    this.orderId = orderId
    this.targetStatus = targetStatus
  }
}

export function updateRiderOrderStatusIO(orderId: OrderId, targetStatus: OrderStatus): TaskIO<OkResponse> {
  return sendAPI(new RiderUpdateOrderStatusAPI(orderId, targetStatus))
}
