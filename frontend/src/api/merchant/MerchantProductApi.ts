import type { TaskIO } from '@/api/shared/TaskIO'
import type { CreateProductRequest, CreateProductResponse, UpdateProductRequest, UpdateProductResponse } from '@/objects/merchant'
import { apiPostIO, apiPutIO } from '@/api/shared/client'

export function createMerchantProductIO(input: CreateProductRequest): TaskIO<CreateProductResponse> {
  return apiPostIO('/merchant/me/products', input)
}

export function updateMerchantProductIO(productId: string, input: UpdateProductRequest): TaskIO<UpdateProductResponse> {
  return apiPutIO(`/merchant/me/products/${productId}`, input)
}
