/** 与后端 `CatalogModels.scala` 对齐 */

import type { MerchantCategory, MerchantId, ProductId } from './ids'

export interface Product {
  id: ProductId
  merchantId: MerchantId
  name: string
  price: number
  description: string
  imageUrl: string
  monthlySales: number
  inventoryStatus: '充足' | '紧张' | '售罄'
  discountText?: string
}

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
