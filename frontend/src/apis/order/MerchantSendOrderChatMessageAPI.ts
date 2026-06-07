import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OrderChatMessageType, OrderChatRole } from '@/objects/order/OrderChatMessage'
import type { OrderChatMessagesResponse } from '@/objects/order/apiTypes/OrderChatMessagesResponse'
import type { OrderId } from '@/objects/shared/ids'

class MerchantSendOrderChatMessageAPI extends APIMessage<OrderChatMessagesResponse> {
  readonly apiName = 'merchantsendorderchatmessageapi'
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

export function sendMerchantOrderChatMessageIO(
  orderId: OrderId,
  peerRole: OrderChatRole,
  messageType: OrderChatMessageType,
  content: string,
): TaskIO<OrderChatMessagesResponse> {
  return sendAPI(new MerchantSendOrderChatMessageAPI(orderId, peerRole, messageType, content))
}
