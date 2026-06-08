import type { Order } from '@/objects/order/Order'
import type { OrderChatRole } from '@/objects/order/OrderChatMessage'
import type { OrderChatUnreadCount } from '@/objects/order/OrderChatUnreadCount'
import type { Merchant } from '@/objects/merchant/Merchant'
import type { Rider } from '@/objects/rider/Rider'
import { RefundStatuses, UserRoles } from '@/objects/shared/ids'

import type { GlobalNotification } from './notificationStorage'

export type NotificationContext = {
  orders: Order[]
  merchants: Merchant[]
  currentRider?: Rider | null
}

export function roleLabel(role: string) {
  if (role === UserRoles.customer) return '顾客'
  if (role === UserRoles.merchant) return '商家'
  if (role === UserRoles.rider) return '骑手'
  return role
}

export function merchantName(order: Order | undefined, context: NotificationContext) {
  if (!order) return '未知店铺'
  return context.merchants.find((merchant) => merchant.id === order.merchantId)?.storeName ?? `店铺 ${order.merchantId}`
}

export function peerDisplayName(order: Order | undefined, peerRole: OrderChatRole | string, context: NotificationContext) {
  if (peerRole === UserRoles.customer) return order?.customerName || order?.customerId || '顾客'
  if (peerRole === UserRoles.merchant) return merchantName(order, context)
  if (peerRole === UserRoles.rider) {
    if (context.currentRider && (!order?.riderId || context.currentRider.id === order.riderId)) return context.currentRider.name
    return order?.riderId ? `骑手 ${order.riderId}` : '骑手'
  }
  return roleLabel(peerRole)
}

export function latestMessageSummary(count: OrderChatUnreadCount) {
  if (count.latestMessageType === 'image') return '发送了图片'
  const content = count.latestContent?.trim()
  if (!content) return `发送了 ${count.unreadCount} 条新消息`
  return `发送了：“${content.length > 48 ? `${content.slice(0, 48)}...` : content}”`
}

export function refundFeedbackMessage(order: Order, context: NotificationContext) {
  const storeName = merchantName(order, context)
  if (order.refundStatus === RefundStatuses.accepted) return `店铺「${storeName}」的订单 ${order.id} 退款申请已通过`
  if (order.refundStatus === RefundStatuses.rejected) return `店铺「${storeName}」的订单 ${order.id} 退款申请已被平台驳回`
  if (order.refundStatus === RefundStatuses.merchantRejected) return `店铺「${storeName}」驳回了订单 ${order.id} 的退款申请`
  if (order.refundStatus === RefundStatuses.adminPending) return `你已将店铺「${storeName}」的订单 ${order.id} 退款申请提交平台仲裁`
  return null
}

export function makeNotification(id: string, message: string, target: string): GlobalNotification {
  return { id, message, target, createdAt: Date.now() }
}

export function mergeNotifications(current: GlobalNotification[], incoming: GlobalNotification[]) {
  const byId = new Map(current.map((item) => [item.id, item]))
  incoming.forEach((item) => {
    byId.set(item.id, byId.get(item.id) ?? item)
  })
  return [...byId.values()].sort((a, b) => b.createdAt - a.createdAt)
}

export function formatNotificationTime(createdAt: number) {
  const date = new Date(createdAt)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
