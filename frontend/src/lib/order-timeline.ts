import type { Order } from '@/objects/order/Order'
import type { OrderTimelineEvent } from '@/objects/order/OrderTimelineEvent'
import { OrderStatuses } from '@/objects/shared/ids'

const timelineKeys = ['placed', 'merchantAccepted', 'merchantReady', 'riderAccepted', 'riderPickedUp', 'delivering', 'delivered', 'completed'] as const

const timelineLabels: Record<(typeof timelineKeys)[number], string> = {
  placed: '已下单',
  merchantAccepted: '商家已接单',
  merchantReady: '商家出餐',
  riderAccepted: '骑手已接单',
  riderPickedUp: '骑手取餐',
  delivering: '配送中',
  delivered: '已送达',
  completed: '已完成/可评价',
}

const statusKeyIndex: Partial<Record<string, number>> = {
  [OrderStatuses.waitingForMerchantAcceptance]: 0,
  [OrderStatuses.cooking]: 1,
  [OrderStatuses.waitingForRiderAcceptance]: 2,
  [OrderStatuses.delivering]: 5,
  [OrderStatuses.delivered]: 6,
  [OrderStatuses.completed]: 7,
}

export interface OrderTimelineNode {
  key: string
  label: string
  time: string | null
  description?: string | null
  state: 'done' | 'current' | 'pending'
}

export function buildOrderTimeline(order: Order): OrderTimelineNode[] {
  const eventByKey = new Map((order.statusTimeline ?? []).map((event) => [event.key, event]))
  const currentIndex = statusKeyIndex[order.status] ?? 0
  return timelineKeys.map((key, index) => {
    const event = eventByKey.get(key)
    return {
      key,
      label: event?.label ?? timelineLabels[key],
      time: event?.occurredAt ?? (key === 'placed' ? order.placedAt : null),
      description: event?.description,
      state: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'pending',
    }
  })
}

export function formatTimelineTime(value: string | null | undefined) {
  if (!value) return '待更新'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function estimateDeliveryRange(order: Order) {
  const baseValue = order.estimatedReadyAt ?? order.statusTimeline?.find((event) => event.key === 'merchantReady')?.occurredAt ?? order.placedAt
  const base = new Date(baseValue)
  if (Number.isNaN(base.getTime())) return null
  const start = new Date(base.getTime() + 25 * 60 * 1000)
  const end = new Date(start.getTime() + 25 * 60 * 1000)
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
  return `${start.toLocaleTimeString([], options)}-${end.toLocaleTimeString([], options)}`
}

export function orderTimelineAlert(order: Order, now = new Date()) {
  if (order.status === OrderStatuses.cooking && order.estimatedReadyAt) {
    const readyAt = new Date(order.estimatedReadyAt)
    if (!Number.isNaN(readyAt.getTime()) && readyAt.getTime() < now.getTime()) return '商家备餐超时，正在加急处理'
  }
  if (order.status === OrderStatuses.waitingForRiderAcceptance) return '餐品已出餐，等待附近骑手接单'
  if (order.status === OrderStatuses.delivering) return '骑手距离可能较远，请留意配送动态'
  return null
}

export function compactTimelineText(order: Order) {
  const nodes = buildOrderTimeline(order)
  const doneCount = nodes.filter((node) => node.state === 'done' || node.state === 'current').length
  return `${doneCount}/${nodes.length} · ${nodes.find((node) => node.state === 'current')?.label ?? order.status}`
}

export type { OrderTimelineEvent }
