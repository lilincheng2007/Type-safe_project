import type { Order } from '@/objects/order/Order'
import { OrderStatuses } from '@/objects/shared/ids'

export const CollapsedListLimit = 3
export const prepTimeOptions = [10, 15, 20, 30]

export function orderItemSummary(order: Order): string {
  return order.items.map((item) => `${item.name}×${item.quantity}`).join('、')
}

export function statusHint(order: Order): string {
  if (order.status === OrderStatuses.waitingForMerchantAcceptance) {
    return '顾客已付款，等待商家确认是否接单。'
  }
  if (order.status === OrderStatuses.cooking) {
    return '已接单，后厨制作完成后可标记出餐。'
  }
  if (order.status === OrderStatuses.waitingForRiderAcceptance) {
    return '已出餐，正在等待骑手接单取餐。'
  }
  if (order.status === OrderStatuses.delivering) {
    return '骑手已接单，餐品正在配送途中。'
  }
  if (order.status === OrderStatuses.canceled) {
    return '订单已取消，款项已按规则退回顾客钱包。'
  }
  return '订单已进入历史记录。'
}
