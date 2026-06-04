import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { CheckoutLine } from '@/objects/order/CheckoutLine'
import type { OrderMerchantNote } from '@/objects/order/apiTypes/CheckoutRequest'
import type { CheckoutResponse } from '@/objects/order/apiTypes/CheckoutResponse'
import type { VoucherId } from '@/objects/shared/ids'

export type CheckoutDeliverySnapshot = {
  customerName: string
  customerPhone: string
  deliveryAddress: string
}

class CheckoutAPI extends APIMessage<CheckoutResponse> {
  readonly apiName = 'checkoutapi'
  readonly lines: CheckoutLine[]
  readonly customerName?: string
  readonly customerPhone?: string
  readonly deliveryAddress?: string
  readonly voucherId?: VoucherId
  readonly merchantNotes: OrderMerchantNote[]

  constructor(lines: CheckoutLine[], customerName?: string, customerPhone?: string, deliveryAddress?: string, voucherId?: VoucherId, merchantNotes: OrderMerchantNote[] = []) {
    super()
    this.lines = lines
    this.customerName = customerName
    this.customerPhone = customerPhone
    this.deliveryAddress = deliveryAddress
    this.voucherId = voucherId
    this.merchantNotes = merchantNotes
  }
}

export function checkoutIO(lines: CheckoutLine[], delivery?: CheckoutDeliverySnapshot, voucherId?: VoucherId, merchantNotes: OrderMerchantNote[] = []): TaskIO<CheckoutResponse> {
  return sendAPI(new CheckoutAPI(lines, delivery?.customerName, delivery?.customerPhone, delivery?.deliveryAddress, voucherId, merchantNotes))
}
