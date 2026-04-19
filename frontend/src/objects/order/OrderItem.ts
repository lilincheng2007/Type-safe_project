import type { ProductId } from '@/objects/shared/ids'

export interface OrderItem {
  productId: ProductId
  name: string
  unitPrice: number
  quantity: number
}
