/** @deprecated 请使用 `@/api` 或 `@/api/services/*-service` */
export {
  checkoutIO,
  createMerchantStoreIO,
  fetchCatalogIO,
  fetchDeliveryOverviewIO,
  fetchOrdersPanelIO,
  fetchPlatformMetaIO,
  patchCustomerProfileIO,
  putMerchantProfileIO,
} from '@/api'
export type {
  CatalogResponse,
  CheckoutLine,
  CheckoutResponse,
  CreateStoreRequest,
  CreateStoreResponse,
  CustomerProfilePatchBody,
  DeliveryOverviewResponse,
  OkResponse,
  OrdersPanelResponse,
  PlatformMetaResponse,
} from '@/delivery/model/api'
export type { MerchantProfile } from '@/delivery/model/profiles'
