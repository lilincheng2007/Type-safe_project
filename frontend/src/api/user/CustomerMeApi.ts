import type { TaskIO } from '@/delivery/io/TaskIO'
import type { CustomerMeResponse } from '@/objects/user/CustomerMeResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchCustomerMeIO(): TaskIO<CustomerMeResponse> {
  return apiGetIO('/auth/me')
}
