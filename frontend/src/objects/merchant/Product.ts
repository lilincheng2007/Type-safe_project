import type { MerchantId, ProductId } from '@/objects/shared/ids'

export interface Product {
  id: ProductId
  merchantId: MerchantId
  name: string
  price: number
  description: string
  imageUrl: string
  monthlySales: number
  remainingStock: number
  listingStatus: '上架' | '下架'
  inventoryStatus: '充足' | '紧张' | '售罄'
  discountText?: string
}
