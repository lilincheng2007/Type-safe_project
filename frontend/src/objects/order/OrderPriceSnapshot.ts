import type { ProductId } from '@/objects/shared/ids'

export interface OrderPriceSnapshotItem {
  productId: ProductId
  name: string
  unitPrice: number
  quantity: number
  lineAmount: number
}

export interface OrderPriceSnapshot {
  items: OrderPriceSnapshotItem[]
  productOriginalAmount: number
  merchantDiscountAmount: number
  voucherDiscountAmount: number
  platformDiscountAmount: number
  deliveryFeeAmount: number
  discountAmount: number
  payableAmount: number
  merchantReceivableAmount: number
  appliedPromotionTitles?: string[]
  usedVoucherTitle?: string | null
}
