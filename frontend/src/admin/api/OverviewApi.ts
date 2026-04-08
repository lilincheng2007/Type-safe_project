import type { TaskIO } from '@/delivery/io/TaskIO'
import type { OverviewResponse } from '../objects/OverviewResponse'
import { apiGetIO } from '@/shared/http/client'

export function fetchOverviewIO(): TaskIO<OverviewResponse> {
  return apiGetIO('/delivery/overview')
}
