import type { ListingStatus, MerchantId } from '@/objects/shared/ids'
import type { ProductBundleGroup, ProductInventoryMode } from '@/objects/merchant/Product'

export interface CreateProductRequest {
  merchantId: MerchantId
  name: string
  description: string
  imageUrl: string
  categoryName: string
  price: number
  remainingStock: number
  listingStatus: ListingStatus
  inventoryMode?: ProductInventoryMode
  maxPerOrder?: number | null
  bundleGroups?: ProductBundleGroup[]
}
