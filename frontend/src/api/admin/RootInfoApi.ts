import type { TaskIO } from '@/api/shared/TaskIO'
import type { RootInfoResponse } from '@/objects/admin/RootInfoResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchRootInfoIO(): TaskIO<RootInfoResponse> {
  return apiGetIO('/admin')
}
