import type { TaskIO } from '@/delivery/io/TaskIO'
import type { CreateStoreRequest } from '@/objects/merchant/CreateStoreRequest'
import type { CreateStoreResponse } from '@/objects/merchant/CreateStoreResponse'
import { apiPostIO } from '@/api/shared/client'

export function createMerchantStoreIO(input: CreateStoreRequest): TaskIO<CreateStoreResponse> {
  return apiPostIO('/delivery/me/merchant/stores', input)
}
