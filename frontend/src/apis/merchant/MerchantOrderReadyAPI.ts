import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OrderId } from '@/objects/shared/ids'
import type { OkResponse } from '@/objects/shared/apiTypes/OkResponse'

class MerchantOrderReadyAPI extends APIMessage<OkResponse> {
  readonly apiName = 'merchantorderreadyapi'
  readonly orderId: OrderId

  constructor(orderId: OrderId) {
    super()
    this.orderId = orderId
  }
}

export function finishMerchantOrderReadyIO(orderId: OrderId): TaskIO<OkResponse> {
  return sendAPI(new MerchantOrderReadyAPI(orderId))
}

export const finishMerchantOrderCookingIO = finishMerchantOrderReadyIO
