import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OrderChatUnreadCountsResponse } from '@/objects/order/apiTypes/OrderChatUnreadCountsResponse'

class MerchantOrderChatUnreadCountsAPI extends APIMessage<OrderChatUnreadCountsResponse> {
  readonly apiName = 'merchantorderchatunreadcountsapi'
}

export function fetchMerchantOrderChatUnreadCountsIO(): TaskIO<OrderChatUnreadCountsResponse> {
  return sendAPI(new MerchantOrderChatUnreadCountsAPI())
}
