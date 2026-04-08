import type { TaskIO } from '@/delivery/io/TaskIO'
import type { CatalogResponse } from '../objects/CatalogResponse'
import { apiGetIO } from '@/shared/http/client'

export function fetchCatalogIO(): TaskIO<CatalogResponse> {
  return apiGetIO('/delivery/catalog')
}
