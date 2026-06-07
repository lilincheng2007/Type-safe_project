import { bundleOptionExtraPrice } from '@/lib/bundles'
import { promotionSummary, roundMoney } from '@/lib/promotions'
import type { Product, ProductBundleGroup, ProductInventoryMode } from '@/objects/merchant/Product'
import { ListingStatuses } from '@/objects/shared/ids'
import type { Promotion } from '@/objects/shared/Promotion'

import type { CreateProductFormState } from '../objects/productDraft'

export const listingStatuses = Object.values(ListingStatuses)

export const initialCreateFormState: CreateProductFormState = {
  name: '',
  description: '',
  imageUrl: '',
  categoryName: '默认分类',
  price: 0,
  remainingStock: 0,
  listingStatus: ListingStatuses.listed,
  inventoryMode: 'finite',
  maxPerOrder: null,
  bundleGroups: [],
}

export const inventoryModeOptions: Array<{ value: ProductInventoryMode; label: string }> = [
  { value: 'unlimited', label: '无限库存' },
  { value: 'finite', label: '今日库存数量' },
  { value: 'soldOut', label: '售罄' },
]

export const bundleGroupTypes: Array<{ value: ProductBundleGroup['selectionType']; label: string }> = [
  { value: 'fixed', label: '指定菜品' },
  { value: 'repeatable', label: '可选菜品，可重复' },
  { value: 'nonRepeatable', label: '可选菜品，不可重复' },
]

export const productCategoryName = (product: Pick<Product, 'categoryName'>) => product.categoryName?.trim() || '默认分类'

export const isBundleProduct = (product: Pick<Product, 'bundleGroups'>) => (product.bundleGroups ?? []).length > 0

export const serializePromotion = (promotion: Promotion | null) => JSON.stringify(promotion)

export const createBundleGroup = (): ProductBundleGroup => ({
  id: `bundle-group-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: '套餐类别',
  quantity: 1,
  selectionType: 'repeatable',
  includedPrice: 0,
  options: [],
})

export const maxBundleOptionPrice = (options: ProductBundleGroup['options'], products: Product[]) => {
  const prices = options
    .map((option) => products.find((item) => item.id === option.productId)?.price)
    .filter((price): price is number => typeof price === 'number' && Number.isFinite(price))
  return prices.length > 0 ? Math.max(...prices) : 0
}

export const hasCustomBundleExtraPrice = (group: ProductBundleGroup) => group.options.some((option) => option.customExtraPrice || option.extraPrice > 0)

export const inventoryText = (product: Product) => {
  if ((product.inventoryMode ?? 'finite') === 'unlimited') return '无限库存'
  if ((product.inventoryMode ?? 'finite') === 'soldOut' || product.inventoryStatus === '售罄') return '已售罄'
  return `今日库存：${product.remainingStock} 份`
}

export const normalizeBundleOption = (option: ProductBundleGroup['options'][number]) => {
  const customExtraPrice = option.customExtraPrice ?? option.extraPrice > 0
  return {
    productId: option.productId,
    recommended: option.recommended ?? false,
    extraPrice: customExtraPrice ? Math.max(0, Number.isFinite(option.extraPrice) ? option.extraPrice : 0) : 0,
    customExtraPrice,
  }
}

export const sanitizeBundleGroups = (groups: ProductBundleGroup[], products: Product[]) =>
  groups
    .map((group) => {
      const selectionType = group.selectionType ?? 'repeatable'
      const uniqueOptions = group.options.filter((option, index, list) => option.productId && list.findIndex((item) => item.productId === option.productId) === index)
      const normalizedOptions = uniqueOptions.map(normalizeBundleOption)
      const hasCustomExtraPrice = normalizedOptions.some((option) => option.customExtraPrice)
      const defaultIncludedPrice = maxBundleOptionPrice(normalizedOptions, products)
      const includedPrice = Number.isFinite(group.includedPrice) && group.includedPrice > 0 ? group.includedPrice : defaultIncludedPrice
      return {
        ...group,
        name: group.name.trim() || '套餐类别',
        quantity: selectionType === 'fixed' ? Math.max(1, normalizedOptions.length) : Math.max(1, Math.floor(group.quantity || 1)),
        selectionType,
        includedPrice: hasCustomExtraPrice ? 0 : Math.max(0, includedPrice),
        options: normalizedOptions,
      }
    })
    .filter((group) => group.options.length > 0)

export const validateBundleGroups = (groups: ProductBundleGroup[], products: Product[]) => {
  const invalidGroup = groups.find((group) => !group.options.some((option) => {
    const product = products.find((item) => item.id === option.productId)
    return product ? bundleOptionExtraPrice(group, product) <= 0 : false
  }))
  return invalidGroup ? `${invalidGroup.name}至少需要包含一个不加价菜品，请调整包含价或加价金额。` : null
}

export function productDiscountedPrice(product: Product, promotion: Promotion) {
  return roundMoney(product.price - promotion.discountValue)
}

export function productDiscountRateText(originalPrice: number, currentPrice: number) {
  if (originalPrice <= 0 || currentPrice <= 0 || !Number.isFinite(currentPrice)) return '—'
  return `${(currentPrice / originalPrice * 10).toFixed(1)}折`
}

export { promotionSummary, roundMoney }
