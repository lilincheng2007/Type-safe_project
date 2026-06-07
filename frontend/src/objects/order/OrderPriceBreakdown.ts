export type OrderPriceBreakdownLineKind = 'charge' | 'discount' | 'total'

export interface OrderPriceBreakdownLine {
  key: string
  label: string
  amount: number
  kind: OrderPriceBreakdownLineKind
}

export interface OrderPriceBreakdown {
  lines: OrderPriceBreakdownLine[]
  productOriginalAmount: number
  merchantDiscountAmount: number
  voucherDiscountAmount: number
  platformDiscountAmount: number
  deliveryFeeAmount: number
  discountAmount: number
  payableAmount: number
}
