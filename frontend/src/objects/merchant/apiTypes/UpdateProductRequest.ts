import type { ListingStatus } from '@/objects/shared/ids'
import type { ProductBundleGroup, ProductInventoryMode } from '@/objects/merchant/Product'

export interface UpdateProductRequest {
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
