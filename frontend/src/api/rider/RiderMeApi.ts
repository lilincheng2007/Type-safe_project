import type { TaskIO } from '@/api/shared/TaskIO'
import type { RiderMeResponse } from '@/objects/rider/RiderMeResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchRiderMeIO(): TaskIO<RiderMeResponse> {
  return apiGetIO('/rider/me')
}
