import type { MerchantId } from '@/objects/shared/ids'

export interface OrderMerchantNote {
  merchantId: MerchantId
  text?: string | null
  imageUrl?: string | null
}
