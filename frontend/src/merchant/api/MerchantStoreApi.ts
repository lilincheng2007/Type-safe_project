import type { TaskIO } from '@/delivery/io/TaskIO'
import type { CreateStoreRequest } from '../objects/CreateStoreRequest'
import type { CreateStoreResponse } from '../objects/CreateStoreResponse'
import { apiPostIO } from '@/shared/http/client'

export function createMerchantStoreIO(input: CreateStoreRequest): TaskIO<CreateStoreResponse> {
  return apiPostIO('/delivery/me/merchant/stores', input)
}
