import type { TaskIO } from '@/delivery/io/TaskIO'
import type { CatalogResponse } from '@/objects/merchant/CatalogResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchCatalogIO(): TaskIO<CatalogResponse> {
  return apiGetIO('/delivery/catalog')
}
