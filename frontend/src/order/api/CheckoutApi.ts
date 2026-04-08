import type { TaskIO } from '@/delivery/io/TaskIO'
import type { CheckoutLine } from '../objects/CheckoutLine'
import type { CheckoutResponse } from '../objects/CheckoutResponse'
import { apiPostIO } from '@/shared/http/client'

export function checkoutIO(lines: CheckoutLine[]): TaskIO<CheckoutResponse> {
  return apiPostIO('/delivery/me/customer/checkout', { lines })
}
