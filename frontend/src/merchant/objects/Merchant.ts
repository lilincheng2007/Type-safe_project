import type { MerchantCategory, ProductId, MerchantId } from '@/delivery/model/ids'

export interface Merchant {
  id: MerchantId
  storeName: string
  category: MerchantCategory
  address: string
  phone: string
  rating: number
  tags: string[]
  featuredProductIds: ProductId[]
}
