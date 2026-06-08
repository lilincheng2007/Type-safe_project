import { productAvailable } from '@/lib/cart-inventory'
import type { Product } from '@/objects/merchant/Product'

export const productCategoryName = (product: { categoryName?: string | null }) => product.categoryName?.trim() || '默认分类'

export function productStockText(product: Product) {
  if ((product.inventoryMode ?? 'finite') === 'unlimited') return '无限库存'
  if (!productAvailable(product)) return '已售罄'
  return `剩余 ${product.remainingStock} 份`
}

export function productLimitText(product: Product) {
  return product.maxPerOrder ? `每单限购 ${product.maxPerOrder} 份` : '不限购'
}
