import type { TaskIO } from '@/delivery/io/TaskIO'
import type { MerchantMeResponse } from '../objects/MerchantMeResponse'
import { apiGetIO } from '@/shared/http/client'

export function fetchMerchantMeIO(): TaskIO<MerchantMeResponse> {
  return apiGetIO('/auth/me')
}
