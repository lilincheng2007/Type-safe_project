import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OrderChatMessageType, OrderChatRole } from '@/objects/order/OrderChatMessage'
import type { OrderChatMessagesResponse } from '@/objects/order/apiTypes/OrderChatMessagesResponse'
import type { OrderId } from '@/objects/shared/ids'

class RiderSendOrderChatMessageAPI extends APIMessage<OrderChatMessagesResponse> {
  readonly apiName = 'ridersendorderchatmessageapi'
  readonly orderId: OrderId
  readonly peerRole: OrderChatRole
  readonly messageType: OrderChatMessageType
  readonly content: string

  constructor(orderId: OrderId, peerRole: OrderChatRole, messageType: OrderChatMessageType, content: string) {
    super()
    this.orderId = orderId
    this.peerRole = peerRole
    this.messageType = messageType
    this.content = content
  }
}

export function sendRiderOrderChatMessageIO(
  orderId: OrderId,
  peerRole: OrderChatRole,
  messageType: OrderChatMessageType,
  content: string,
): TaskIO<OrderChatMessagesResponse> {
  return sendAPI(new RiderSendOrderChatMessageAPI(orderId, peerRole, messageType, content))
}
