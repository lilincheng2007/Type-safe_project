import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { CustomerOrdersResponse } from '@/objects/order/apiTypes/CustomerOrdersResponse'

class CustomerOrdersAPI extends APIMessage<CustomerOrdersResponse> {
  readonly apiName = 'customerordersapi'
}

export function fetchCustomerOrdersIO(): TaskIO<CustomerOrdersResponse> {
  return sendAPI(new CustomerOrdersAPI())
}
