import type { TaskIO } from '@/delivery/io/TaskIO'
import type { HealthOk } from '@/objects/shared/HealthOk'
import { apiGetIO } from '@/api/shared/client'

export function fetchHealthIO(): TaskIO<HealthOk> {
  return apiGetIO('/health')
}
