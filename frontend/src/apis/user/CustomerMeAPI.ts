import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { CustomerMeResponse } from '@/objects/user/apiTypes/CustomerMeResponse'

class CustomerMeAPI extends APIMessage<CustomerMeResponse> {
  readonly apiName = 'customermeapi'
}

export function fetchCustomerMeIO(): TaskIO<CustomerMeResponse> {
  return sendAPI(new CustomerMeAPI())
}
