/**
 * 前端 HTTP 层：按后端微服务拆分于 `services/`，路径常量见 `gateway-paths.ts`。
 */
export { gatewayPaths } from './gateway-paths'
export { ApiError, apiFetchIO, apiGetIO, apiPatchIO, apiPostIO, apiPutIO, runTask } from './client'
export { loginIO, registerIO, fetchMeIO, patchCustomerProfileIO } from './services/user-service'
export { checkoutIO } from './services/order-service'
export { createMerchantStoreIO, fetchCatalogIO, putMerchantProfileIO } from './services/merchant-service'
export {
  fetchDeliveryOverviewIO,
  fetchOrdersPanelIO,
  fetchPlatformMetaIO,
} from './services/admin-service'
export { fetchRiderMeIO } from './services/rider-service'
