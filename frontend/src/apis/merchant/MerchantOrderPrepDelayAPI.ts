import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OkResponse } from '@/objects/shared/apiTypes/OkResponse'
import type { OrderId } from '@/objects/shared/ids'

class MerchantOrderPrepDelayAPI extends APIMessage<OkResponse> {
  readonly apiName = 'merchantorderprepdelayapi'
  readonly orderId: OrderId
  readonly extraMinutes: number
  readonly reason: string

  constructor(orderId: OrderId, extraMinutes: number, reason: string) {
    super()
    this.orderId = orderId
    this.extraMinutes = extraMinutes
    this.reason = reason
  }
}

export function delayMerchantOrderPrepIO(orderId: OrderId, extraMinutes: number, reason: string): TaskIO<OkResponse> {
  return sendAPI(new MerchantOrderPrepDelayAPI(orderId, extraMinutes, reason))
}
