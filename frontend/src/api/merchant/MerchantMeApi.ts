import type { TaskIO } from '@/delivery/io/TaskIO'
import type { MerchantMeResponse } from '@/objects/merchant/MerchantMeResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchMerchantMeIO(): TaskIO<MerchantMeResponse> {
  return apiGetIO('/auth/me')
}
