import type { TaskIO } from '@/delivery/io/TaskIO'
import type { CheckoutLine } from '@/objects/order/CheckoutLine'
import type { CheckoutResponse } from '@/objects/order/CheckoutResponse'
import { apiPostIO } from '@/api/shared/client'

export function checkoutIO(lines: CheckoutLine[]): TaskIO<CheckoutResponse> {
  return apiPostIO('/delivery/me/customer/checkout', { lines })
}
