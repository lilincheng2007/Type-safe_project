import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OrderId } from '@/objects/shared/ids'
import type { OkResponse } from '@/objects/shared/apiTypes/OkResponse'

class MerchantOrderAcceptAPI extends APIMessage<OkResponse> {
  readonly apiName = 'merchantorderacceptapi'
  readonly orderId: OrderId
  readonly prepMinutes?: number

  constructor(orderId: OrderId, prepMinutes?: number) {
    super()
    this.orderId = orderId
    this.prepMinutes = prepMinutes
  }
}

export function acceptMerchantOrderIO(orderId: OrderId, prepMinutes?: number): TaskIO<OkResponse> {
  return sendAPI(new MerchantOrderAcceptAPI(orderId, prepMinutes))
}
