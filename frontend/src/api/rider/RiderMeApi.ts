import type { TaskIO } from '@/delivery/io/TaskIO'
import type { RiderMeResponse } from '@/objects/rider/RiderMeResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchRiderMeIO(): TaskIO<RiderMeResponse> {
  return apiGetIO('/auth/me')
}
