import type { TaskIO } from '@/api/shared/TaskIO'
import type { CatalogResponse } from '@/objects/merchant/CatalogResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchCatalogIO(): TaskIO<CatalogResponse> {
  return apiGetIO('/merchant/catalog')
}
