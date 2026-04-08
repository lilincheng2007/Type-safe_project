import type { TaskIO } from '@/delivery/io/TaskIO'
import type { MerchantProfile } from '../objects/MerchantProfile'
import type { OkResponse } from '@/shared/objects/OkResponse'
import { apiPutIO } from '@/shared/http/client'

export function putMerchantProfileIO(profile: MerchantProfile): TaskIO<OkResponse> {
  return apiPutIO('/delivery/me/merchant/profile', { profile })
}
