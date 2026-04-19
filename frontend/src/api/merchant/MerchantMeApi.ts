import type { TaskIO } from '@/api/shared/TaskIO'
import type { MerchantMeResponse } from '@/objects/merchant/MerchantMeResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchMerchantMeIO(): TaskIO<MerchantMeResponse> {
  return apiGetIO('/merchant/me')
}
