import type { Order } from '@/objects/order/Order'
import type { OrderPriceBreakdown, OrderPriceBreakdownLine } from '@/objects/order/OrderPriceBreakdown'

export function createOrderPriceBreakdown(input: {
  productOriginalAmount: number
  merchantDiscountAmount?: number
  voucherDiscountAmount?: number
  platformDiscountAmount?: number
  deliveryFeeAmount?: number
  payableAmount: number
}): OrderPriceBreakdown {
  const merchantDiscountAmount = roundMoney(input.merchantDiscountAmount ?? 0)
  const voucherDiscountAmount = roundMoney(input.voucherDiscountAmount ?? 0)
  const platformDiscountAmount = roundMoney(input.platformDiscountAmount ?? 0)
  const deliveryFeeAmount = roundMoney(input.deliveryFeeAmount ?? 0)
  const discountAmount = roundMoney(merchantDiscountAmount + voucherDiscountAmount + platformDiscountAmount)
  const lines: OrderPriceBreakdownLine[] = [
    { key: 'productOriginalAmount', label: '商品原价', amount: roundMoney(input.productOriginalAmount), kind: 'charge' },
  ]

  if (merchantDiscountAmount > 0) lines.push({ key: 'merchantDiscountAmount', label: '商家优惠', amount: merchantDiscountAmount, kind: 'discount' })
  if (voucherDiscountAmount > 0) lines.push({ key: 'voucherDiscountAmount', label: '优惠券抵扣', amount: voucherDiscountAmount, kind: 'discount' })
  if (platformDiscountAmount > 0) lines.push({ key: 'platformDiscountAmount', label: '平台优惠', amount: platformDiscountAmount, kind: 'discount' })

  lines.push({ key: 'deliveryFeeAmount', label: '配送费', amount: deliveryFeeAmount, kind: 'charge' })
  lines.push({ key: 'discountAmount', label: '优惠抵扣合计', amount: discountAmount, kind: 'discount' })
  lines.push({ key: 'payableAmount', label: '实付金额', amount: roundMoney(input.payableAmount), kind: 'total' })

  return {
    lines,
    productOriginalAmount: roundMoney(input.productOriginalAmount),
    merchantDiscountAmount,
    voucherDiscountAmount,
    platformDiscountAmount,
    deliveryFeeAmount,
    discountAmount,
    payableAmount: roundMoney(input.payableAmount),
  }
}

export function orderPriceBreakdown(order: Order): OrderPriceBreakdown {
  if (order.priceBreakdown) return order.priceBreakdown

  const merchantDiscountAmount = order.merchantDiscountAmount ?? 0
  const legacyCustomerOnlyDiscount = order.platformDiscountAmount ?? 0
  return createOrderPriceBreakdown({
    productOriginalAmount: order.originalAmount,
    merchantDiscountAmount,
    voucherDiscountAmount: order.usedVoucher ? Math.min(order.usedVoucher.discountAmount, legacyCustomerOnlyDiscount) : 0,
    platformDiscountAmount: order.usedVoucher ? Math.max(0, legacyCustomerOnlyDiscount - order.usedVoucher.discountAmount) : legacyCustomerOnlyDiscount,
    deliveryFeeAmount: 0,
    payableAmount: order.payableAmount,
  })
}

export function priceBreakdownAmountText(line: OrderPriceBreakdownLine): string {
  const prefix = line.kind === 'discount' ? '-¥' : '¥'
  return `${prefix}${roundMoney(line.amount).toFixed(2)}`
}

export function priceBreakdownAmountClassName(line: OrderPriceBreakdownLine): string {
  if (line.kind === 'discount') return 'text-green-600'
  if (line.kind === 'total') return 'font-semibold text-orange-700'
  return 'text-foreground'
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
