import type { TaskIO } from '@/delivery/io/TaskIO'
import type { RiderMeResponse } from '../objects/RiderMeResponse'
import { apiGetIO } from '@/shared/http/client'

export function fetchRiderMeIO(): TaskIO<RiderMeResponse> {
  return apiGetIO('/auth/me')
}
