import type { TaskIO } from '@/api/shared/TaskIO'
import type { AdminMeResponse } from '@/objects/admin/AdminMeResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchAdminMeIO(): TaskIO<AdminMeResponse> {
  return apiGetIO('/admin/me')
}
