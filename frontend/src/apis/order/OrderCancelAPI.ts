import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OrderCancelResponse } from '@/objects/order/apiTypes/OrderCancelResponse'
import type { OrderId } from '@/objects/shared/ids'

class OrderCancelAPI extends APIMessage<OrderCancelResponse> {
  readonly apiName = 'ordercancelapi'
  readonly orderId: OrderId

  constructor(orderId: OrderId) {
    super()
    this.orderId = orderId
  }
}

export function cancelOrderIO(orderId: OrderId): TaskIO<OrderCancelResponse> {
  return sendAPI(new OrderCancelAPI(orderId))
}
