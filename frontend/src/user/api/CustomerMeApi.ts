import type { TaskIO } from '@/delivery/io/TaskIO'
import type { CustomerMeResponse } from '../objects/CustomerMeResponse'
import { apiGetIO } from '@/shared/http/client'

export function fetchCustomerMeIO(): TaskIO<CustomerMeResponse> {
  return apiGetIO('/auth/me')
}
