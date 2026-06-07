import type { Product, ProductBundleGroup } from '@/objects/merchant/Product'
import type { CheckoutBundleSelection } from '@/objects/order/CheckoutLine'

export const isBundleProduct = (product: Pick<Product, 'bundleGroups'>) => (product.bundleGroups ?? []).length > 0

export const bundleOptionExtraPrice = (group: ProductBundleGroup, optionProduct: Product) => {
  const matched = group.options.find((option) => option.productId === optionProduct.id)
  if (!matched) return 0
  if (matched.customExtraPrice || matched.extraPrice > 0) return Math.max(0, matched.extraPrice)
  const includedPrice = group.includedPrice ?? 0
  return includedPrice > 0 ? Math.max(0, optionProduct.price - includedPrice) : 0
}

export const bundleBasePrice = (product: Product) => product.price

export const bundleLineUnitPrice = (
  product: Product,
  selections: CheckoutBundleSelection[] | undefined,
  products: Product[],
) => {
  if (!isBundleProduct(product)) return product.price
  const basePrice = bundleBasePrice(product)
  const extraPrice = (product.bundleGroups ?? []).reduce((sum, group) => {
    const groupExtra = (selections ?? [])
      .filter((selection) => selection.groupId === group.id)
      .reduce((groupSum, selection) => {
        const selectedProduct = products.find((item) => item.id === selection.productId)
        return groupSum + (selectedProduct ? bundleOptionExtraPrice(group, selectedProduct) * selection.quantity : 0)
      }, 0)
    return sum + groupExtra
  }, 0)
  return basePrice + extraPrice
}

export const bundleSelectionSummary = (
  product: Product,
  selections: CheckoutBundleSelection[] | undefined,
  products: Product[],
) => {
  const activeSelections = selections ?? []
  if (activeSelections.length === 0) return ''

  if (isBundleProduct(product)) {
    return (product.bundleGroups ?? [])
      .map((group) => {
        const names = activeSelections
          .filter((selection) => selection.groupId === group.id)
          .flatMap((selection) => {
            const selectedProduct = products.find((item) => item.id === selection.productId)
            return selectedProduct ? [`${selectedProduct.name}x${selection.quantity}`] : []
          })
        return names.length > 0 ? `${group.name}：${names.join('、')}` : null
      })
      .filter(Boolean)
      .join('；')
  }

  const names = activeSelections.flatMap((selection) => {
    const selectedProduct = products.find((item) => item.id === selection.productId)
    return selectedProduct ? [`${selectedProduct.name}x${selection.quantity}`] : []
  })
  return names.length > 0 ? `套餐内容：${names.join('、')}` : ''
}
