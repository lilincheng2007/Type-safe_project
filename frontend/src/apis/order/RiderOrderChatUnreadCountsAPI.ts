import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OrderChatUnreadCountsResponse } from '@/objects/order/apiTypes/OrderChatUnreadCountsResponse'

class RiderOrderChatUnreadCountsAPI extends APIMessage<OrderChatUnreadCountsResponse> {
  readonly apiName = 'riderorderchatunreadcountsapi'
}

export function fetchRiderOrderChatUnreadCountsIO(): TaskIO<OrderChatUnreadCountsResponse> {
  return sendAPI(new RiderOrderChatUnreadCountsAPI())
}
