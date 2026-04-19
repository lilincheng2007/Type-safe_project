import type { TaskIO } from '@/api/shared/TaskIO'
import type { MerchantProfile } from '@/objects/merchant/MerchantProfile'
import type { OkResponse } from '@/objects/shared/OkResponse'
import { apiPutIO } from '@/api/shared/client'

export function putMerchantProfileIO(profile: MerchantProfile): TaskIO<OkResponse> {
  return apiPutIO('/merchant/me/profile', { profile })
}
