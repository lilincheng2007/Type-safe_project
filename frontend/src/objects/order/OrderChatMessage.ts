import type { OrderId } from '@/objects/shared/ids'

export type OrderChatRole = 'customer' | 'merchant' | 'rider'
export type OrderChatMessageType = 'text' | 'image'

export interface OrderChatMessage {
  id: string
  orderId: OrderId
  senderRole: OrderChatRole
  peerRole: OrderChatRole
  messageType: OrderChatMessageType
  content: string
  createdAt: string
}
