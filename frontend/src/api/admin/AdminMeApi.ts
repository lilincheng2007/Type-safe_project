import type { TaskIO } from '@/delivery/io/TaskIO'
import type { AdminMeResponse } from '@/objects/admin/AdminMeResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchAdminMeIO(): TaskIO<AdminMeResponse> {
  return apiGetIO('/auth/me')
}
