import type { InventoryStatus, ListingStatus, MerchantId, ProductId } from '@/objects/shared/ids'

export type ProductBundleGroupSelectionType = 'fixed' | 'repeatable' | 'nonRepeatable'
export type ProductInventoryMode = 'unlimited' | 'finite' | 'soldOut'

export interface ProductBundleOption {
  productId: ProductId
  recommended: boolean
  extraPrice: number
  customExtraPrice?: boolean
}

export interface ProductBundleGroup {
  id: string
  name: string
  quantity: number
  selectionType: ProductBundleGroupSelectionType
  includedPrice: number
  options: ProductBundleOption[]
}

export interface Product {
  id: ProductId
  merchantId: MerchantId
  name: string
  price: number
  description: string
  imageUrl: string
  categoryName?: string
  monthlySales: number
  remainingStock: number
  listingStatus: ListingStatus
  inventoryStatus: InventoryStatus
  inventoryMode?: ProductInventoryMode
  maxPerOrder?: number | null
  discountText?: string
  bundleGroups?: ProductBundleGroup[]
}
