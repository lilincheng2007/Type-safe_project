import type { MerchantId, ProductId } from '@/delivery/model/ids'

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
