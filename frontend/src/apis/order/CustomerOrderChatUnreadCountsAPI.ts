import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OrderChatUnreadCountsResponse } from '@/objects/order/apiTypes/OrderChatUnreadCountsResponse'

class CustomerOrderChatUnreadCountsAPI extends APIMessage<OrderChatUnreadCountsResponse> {
  readonly apiName = 'customerorderchatunreadcountsapi'
}

export function fetchCustomerOrderChatUnreadCountsIO(): TaskIO<OrderChatUnreadCountsResponse> {
  return sendAPI(new CustomerOrderChatUnreadCountsAPI())
}
