export interface CreateProductRequest {
  merchantId: string
  name: string
  description: string
  price: number
  remainingStock: number
  listingStatus: '上架' | '下架'
}
