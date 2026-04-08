import type { TaskIO } from '@/delivery/io/TaskIO'
import type { AdminMeResponse } from '../objects/AdminMeResponse'
import { apiGetIO } from '@/shared/http/client'

export function fetchAdminMeIO(): TaskIO<AdminMeResponse> {
  return apiGetIO('/auth/me')
}
