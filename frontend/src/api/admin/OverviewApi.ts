import type { TaskIO } from '@/api/shared/TaskIO'
import type { OverviewResponse } from '@/objects/admin/OverviewResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchOverviewIO(): TaskIO<OverviewResponse> {
  return apiGetIO('/admin/overview')
}
