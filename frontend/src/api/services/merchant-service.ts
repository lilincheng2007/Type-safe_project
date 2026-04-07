/**
 * 对应后端 **merchant-service**（目录、商户档案与门店）。
 */
import type { TaskIO } from '@/delivery/io/TaskIO'
import type {
  CatalogResponse,
  CreateStoreRequest,
  CreateStoreResponse,
  OkResponse,
} from '@/delivery/model/api'
import type { MerchantProfile } from '@/delivery/model/profiles'
import { apiGetIO, apiPostIO, apiPutIO } from '../client'
import { gatewayPaths } from '../gateway-paths'

const { delivery } = gatewayPaths

export function fetchCatalogIO(): TaskIO<CatalogResponse> {
  return apiGetIO(delivery.catalog)
}

export function putMerchantProfileIO(profile: MerchantProfile): TaskIO<OkResponse> {
  return apiPutIO(delivery.merchantProfile, { profile })
}

export function createMerchantStoreIO(input: CreateStoreRequest): TaskIO<CreateStoreResponse> {
  return apiPostIO(delivery.merchantStores, input)
}
