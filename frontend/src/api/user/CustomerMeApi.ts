import type { TaskIO } from '@/api/shared/TaskIO'
import type { CustomerMeResponse } from '@/objects/user/CustomerMeResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchCustomerMeIO(): TaskIO<CustomerMeResponse> {
  return apiGetIO('/user/me')
}
