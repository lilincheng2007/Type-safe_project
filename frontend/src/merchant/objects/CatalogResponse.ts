import type { Merchant } from './Merchant'
import type { Product } from './Product'

export interface CatalogResponse {
  merchants: Merchant[]
  products: Product[]
}
