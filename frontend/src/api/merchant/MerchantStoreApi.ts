import type { TaskIO } from '@/api/shared/TaskIO'
import type { CreateStoreRequest } from '@/objects/merchant/CreateStoreRequest'
import type { CreateStoreResponse } from '@/objects/merchant/CreateStoreResponse'
import { apiPostIO } from '@/api/shared/client'

export function createMerchantStoreIO(input: CreateStoreRequest): TaskIO<CreateStoreResponse> {
  return apiPostIO('/merchant/me/stores', input)
}
