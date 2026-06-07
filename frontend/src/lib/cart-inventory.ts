import type { Product } from '@/objects/merchant/Product'
import type { CheckoutBundleSelection } from '@/objects/order/CheckoutLine'

export type CartInventoryLine = {
  merchantId: string
  productId: string
  quantity: number
  bundleSelections?: CheckoutBundleSelection[]
}

export const cartLineKey = (line: Pick<CartInventoryLine, 'merchantId' | 'productId' | 'bundleSelections'>) =>
  `${line.merchantId}::${line.productId}::${JSON.stringify(line.bundleSelections ?? [])}`

export const productAvailable = (product: Product) =>
  product.listingStatus === '上架' &&
  (product.inventoryMode ?? 'finite') !== 'soldOut' &&
  ((product.inventoryMode ?? 'finite') === 'unlimited' || product.remainingStock > 0)

export const maxOrderQuantity = (product: Product) => {
  const stockLimit = (product.inventoryMode ?? 'finite') === 'unlimited' ? Number.POSITIVE_INFINITY : product.remainingStock
  return Math.max(0, Math.min(stockLimit, product.maxPerOrder ?? Number.POSITIVE_INFINITY))
}

const addQuantity = (values: Record<string, number>, productId: string, quantity: number) => {
  if (quantity <= 0) return values
  return { ...values, [productId]: (values[productId] ?? 0) + quantity }
}

export const lineConsumedQuantities = (line: CartInventoryLine, products: Product[]) => {
  const product = products.find((item) => item.id === line.productId && item.merchantId === line.merchantId)
  if (!product) return {}

  let consumed = addQuantity({}, product.id, 1)
  if ((product.bundleGroups ?? []).length === 0) return consumed

  const allowedOptionIds = new Set((product.bundleGroups ?? []).flatMap((group) => group.options.map((option) => option.productId)))
  for (const selection of line.bundleSelections ?? []) {
    const optionProduct = products.find((item) => item.id === selection.productId && item.merchantId === product.merchantId)
    if (optionProduct && allowedOptionIds.has(selection.productId)) {
      consumed = addQuantity(consumed, selection.productId, selection.quantity)
    }
  }
  return consumed
}

export const cartConsumedQuantities = (lines: CartInventoryLine[], products: Product[]) =>
  lines.reduce<Record<string, number>>((consumed, line) => {
    const perLine = lineConsumedQuantities(line, products)
    return Object.entries(perLine).reduce(
      (next, [productId, quantity]) => addQuantity(next, productId, quantity * Math.max(0, line.quantity)),
      consumed,
    )
  }, {})

export const maxCartLineQuantity = (line: CartInventoryLine, products: Product[], otherLines: CartInventoryLine[] = []) => {
  const perLine = lineConsumedQuantities(line, products)
  const consumed = cartConsumedQuantities(otherLines, products)
  const limits = Object.entries(perLine).map(([productId, quantityPerLine]) => {
    const product = products.find((item) => item.id === productId)
    if (!product || quantityPerLine <= 0 || !productAvailable(product)) return 0
    const remainingAllowance = maxOrderQuantity(product) - (consumed[productId] ?? 0)
    return Math.floor(remainingAllowance / quantityPerLine)
  })

  if (limits.length === 0) return 0
  return Math.max(0, Math.min(...limits))
}

export const normalizeCartLines = <T extends CartInventoryLine>(lines: T[], products: Product[]) => {
  const normalized: T[] = []
  for (const line of lines) {
    const maxQuantity = maxCartLineQuantity(line, products, normalized)
    const quantity = Math.min(Math.max(0, line.quantity), maxQuantity)
    if (quantity > 0) {
      normalized.push({ ...line, quantity })
    }
  }
  return normalized
}
