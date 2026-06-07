import type { CreateProductRequest } from '@/objects/merchant/apiTypes/CreateProductRequest'
import type { Product, ProductBundleGroup, ProductInventoryMode } from '@/objects/merchant/Product'
import type { UpdateProductRequest } from '@/objects/merchant/apiTypes/UpdateProductRequest'
import type { MerchantStoreProfile } from '@/objects/merchant/MerchantStoreProfile'
import type { ProductId } from '@/objects/shared/ids'
import type { Promotion } from '@/objects/shared/Promotion'

export type ProductsTabProps = {
  selectedStore: MerchantStoreProfile | null
  onCreateProduct: (input: CreateProductRequest) => Promise<Product>
  onEditProduct: (productId: ProductId, input: UpdateProductRequest) => Promise<void>
  onUploadProductImage: (productId: ProductId, file: File) => Promise<Product>
}

export type ProductFormState = UpdateProductRequest

export type CreateProductFormState = {
  name: string
  description: string
  imageUrl: string
  categoryName: string
  price: number
  remainingStock: number
  listingStatus: CreateProductRequest['listingStatus']
  inventoryMode: ProductInventoryMode
  maxPerOrder: number | null
  bundleGroups: ProductBundleGroup[]
}

export type StorePromotionDialogState = {
  mode: 'add' | 'edit'
  promotion: Promotion
  original: Promotion | null
}
