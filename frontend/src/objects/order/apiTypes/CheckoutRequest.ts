import type { VoucherId } from '@/objects/shared/ids'
import type { MerchantId } from '@/objects/shared/ids'

import type { CheckoutLine } from '../CheckoutLine'

export interface OrderMerchantNote {
  merchantId: MerchantId
  text?: string | null
  imageUrl?: string | null
}

export interface CheckoutRequest {
  lines: CheckoutLine[]
  customerName?: string
  customerPhone?: string
  deliveryAddress?: string
  voucherId?: VoucherId
  merchantNotes?: OrderMerchantNote[]
}
