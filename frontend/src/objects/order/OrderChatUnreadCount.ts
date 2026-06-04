import type { OrderChatRole } from '@/objects/order/OrderChatMessage'
import type { OrderId } from '@/objects/shared/ids'

export interface OrderChatUnreadCount {
  orderId: OrderId
  peerRole: OrderChatRole
  unreadCount: number
}
