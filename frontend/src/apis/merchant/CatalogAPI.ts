import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { CatalogResponse } from '@/objects/merchant/apiTypes/CatalogResponse'

class CatalogAPI extends APIMessage<CatalogResponse> {
  readonly apiName = 'catalogapi'
}

export function fetchCatalogIO(): TaskIO<CatalogResponse> {
  return sendAPI(new CatalogAPI())
}
