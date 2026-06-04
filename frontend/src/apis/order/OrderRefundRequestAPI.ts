import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OrderRefundRequestResponse } from '@/objects/order/apiTypes/OrderRefundRequestResponse'
import type { OrderId } from '@/objects/shared/ids'

class OrderRefundRequestAPI extends APIMessage<OrderRefundRequestResponse> {
  readonly apiName = 'orderrefundrequestapi'
  readonly orderId: OrderId
  readonly reason: string
  readonly imageUrl: string | null

  constructor(orderId: OrderId, reason: string, imageUrl: string | null) {
    super()
    this.orderId = orderId
    this.reason = reason
    this.imageUrl = imageUrl
  }
}

export function requestOrderRefundIO(orderId: OrderId, reason: string, imageUrl: string | null): TaskIO<OrderRefundRequestResponse> {
  return sendAPI(new OrderRefundRequestAPI(orderId, reason, imageUrl))
}
