import type { Order } from '@/objects/order/Order'
import { OrderStatuses } from '@/objects/shared/ids'

export const CollapsedListLimit = 3

export const getOrderStatusDescription = (order: Order) => {
  if (order.status === OrderStatuses.waitingForMerchantAcceptance) {
    return '订单已提交，正在等待商家确认接单'
  }
  if (order.status === OrderStatuses.cooking) {
    return '商家已接单，后厨正在制作餐品'
  }
  if (order.status === OrderStatuses.waitingForRiderAcceptance) {
    return '商家已出餐，正在等待骑手接单取餐'
  }
  if (order.status === OrderStatuses.delivering) {
    return '骑手已接单，餐品正在配送途中'
  }
  if (order.status === OrderStatuses.delivered) {
    return '餐品已送达，可确认完成'
  }
  if (order.status === OrderStatuses.canceled) {
    return '订单已取消，款项已按规则退回钱包'
  }
  if (order.status === OrderStatuses.refunded) {
    return '退款已通过，款项已退回钱包'
  }
  return null
}
