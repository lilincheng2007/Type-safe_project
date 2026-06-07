import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OrderChatRole } from '@/objects/order/OrderChatMessage'
import type { OrderChatMessagesResponse } from '@/objects/order/apiTypes/OrderChatMessagesResponse'
import type { OrderId } from '@/objects/shared/ids'

class CustomerOrderChatMessagesAPI extends APIMessage<OrderChatMessagesResponse> {
  readonly apiName = 'customerorderchatmessagesapi'
  readonly orderId: OrderId
  readonly peerRole: OrderChatRole

  constructor(orderId: OrderId, peerRole: OrderChatRole) {
    super()
    this.orderId = orderId
    this.peerRole = peerRole
  }
}

export function fetchCustomerOrderChatMessagesIO(orderId: OrderId, peerRole: OrderChatRole): TaskIO<OrderChatMessagesResponse> {
  return sendAPI(new CustomerOrderChatMessagesAPI(orderId, peerRole))
}
