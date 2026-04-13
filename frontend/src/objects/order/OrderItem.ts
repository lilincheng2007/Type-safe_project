import type { ProductId } from '@/delivery/model/ids'

export interface OrderItem {
  productId: ProductId
  name: string
  unitPrice: number
  quantity: number
}
