import type { TaskIO } from '@/delivery/io/TaskIO'
import type { OverviewResponse } from '@/objects/admin/OverviewResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchOverviewIO(): TaskIO<OverviewResponse> {
  return apiGetIO('/delivery/overview')
}
