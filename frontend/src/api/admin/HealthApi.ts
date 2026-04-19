import type { TaskIO } from '@/api/shared/TaskIO'
import type { HealthOk } from '@/objects/shared/HealthOk'
import { apiGetIO } from '@/api/shared/client'

export function fetchHealthIO(): TaskIO<HealthOk> {
  return apiGetIO('/admin/health')
}
