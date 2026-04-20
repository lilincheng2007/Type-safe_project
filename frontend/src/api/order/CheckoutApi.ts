import type { TaskIO } from '@/api/shared/TaskIO'
import type { CheckoutLine } from '@/objects/order/CheckoutLine'
import type { CheckoutResponse } from '@/objects/order/CheckoutResponse'
import { apiPostIO } from '@/api/shared/client'

export type CheckoutDeliverySnapshot = {
  customerName: string
  customerPhone: string
  deliveryAddress: string
}

export function checkoutIO(lines: CheckoutLine[], delivery?: CheckoutDeliverySnapshot): TaskIO<CheckoutResponse> {
  const body: Record<string, unknown> = { lines }
  if (delivery) {
    body.customerName = delivery.customerName
    body.customerPhone = delivery.customerPhone
    body.deliveryAddress = delivery.deliveryAddress
  }
  return apiPostIO('/order/checkout', body)
}
