import type { MerchantProfile } from '@/domain-types/accounts'
import type {
  ComplaintTicket,
  CustomerServiceAgent,
  Merchant,
  MerchantApplication,
  OperationsManager,
  Order,
  Product,
  PromotionCampaign,
  Rider,
} from '@/domain-types'
import { apiGet, apiPatch, apiPost, apiPut } from '@/lib/api/client'

export interface CatalogResponse {
  merchants: Merchant[]
  products: Product[]
}

export interface CheckoutResponse {
  orders: Order[]
  walletBalance: number
}

export interface DeliveryOverviewResponse {
  merchants: Merchant[]
  orders: Order[]
  riders: Rider[]
  campaigns: PromotionCampaign[]
  complaintTickets: ComplaintTicket[]
}

export interface OrdersPanelResponse {
  orders: Order[]
  riders: Rider[]
}

export interface PlatformMetaResponse {
  campaigns: PromotionCampaign[]
  complaintTickets: ComplaintTicket[]
  merchantApplications: MerchantApplication[]
  serviceAgents: CustomerServiceAgent[]
  operationsManagers: OperationsManager[]
}

export function fetchCatalog() {
  return apiGet<CatalogResponse>('/delivery/catalog')
}

export function checkoutApi(lines: { merchantId: string; productId: string; quantity: number }[]) {
  return apiPost<CheckoutResponse>('/delivery/me/customer/checkout', { lines })
}

export function patchCustomerProfileApi(patch: {
  walletBalance?: number
  defaultAddress?: string
  name?: string
  phone?: string
}) {
  return apiPatch<{ ok: boolean }>('/delivery/me/customer/profile', patch)
}

export function putMerchantProfileApi(profile: MerchantProfile) {
  return apiPut<{ ok: boolean }>('/delivery/me/merchant/profile', { profile })
}

export function createMerchantStoreApi(input: { storeName: string; address: string }) {
  return apiPost<{ ok: boolean; merchantId: string }>('/delivery/me/merchant/stores', input)
}

export function fetchDeliveryOverview() {
  return apiGet<DeliveryOverviewResponse>('/delivery/overview')
}

export function fetchOrdersPanel() {
  return apiGet<OrdersPanelResponse>('/delivery/orders-panel')
}

export function fetchPlatformMeta() {
  return apiGet<PlatformMetaResponse>('/delivery/platform-meta')
}
