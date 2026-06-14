import { UserRoles } from '@/objects/shared/ids'
import type { Order } from '@/objects/order/Order'
import type { OrderChatRole } from '@/objects/order/OrderChatMessage'

export const roleLabels: Record<OrderChatRole, string> = {
  customer: '顾客',
  merchant: '商家',
  rider: '骑手',
}

export const chatPeers: Record<OrderChatRole, OrderChatRole[]> = {
  customer: ['merchant', 'rider'],
  merchant: ['customer', 'rider'],
  rider: ['customer', 'merchant'],
}

export function isOrderChatRole(value: string | null): value is OrderChatRole {
  return value === UserRoles.customer || value === UserRoles.merchant || value === UserRoles.rider
}

export function formatMessageTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function customerDisplay(order: Order | undefined) {
  return order?.customerName || order?.customerId || '顾客'
}
