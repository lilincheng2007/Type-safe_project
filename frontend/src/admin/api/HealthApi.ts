import type { TaskIO } from '@/delivery/io/TaskIO'
import type { HealthOk } from '@/shared/objects/HealthOk'
import { apiGetIO } from '@/shared/http/client'

export function fetchHealthIO(): TaskIO<HealthOk> {
  return apiGetIO('/health')
}
