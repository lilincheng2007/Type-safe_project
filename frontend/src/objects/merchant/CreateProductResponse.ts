import type { Product } from './Product'

export interface CreateProductResponse {
  ok: boolean
  product: Product
}
