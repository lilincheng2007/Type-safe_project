/**
 * 与后端 `ApiDto.scala` 中请求/响应 DTO 及路由 JSON 契约对齐。
 */

import type {
  AdminAccountPublic,
  CustomerAccountPublic,
  MerchantAccountPublic,
  RiderAccountPublic,
} from './accounts'
import type { ComplaintTicket, CustomerServiceAgent, MerchantApplication, OperationsManager, PromotionCampaign } from './platform'
import type { Merchant, Product } from './catalog'
import type { UserRole } from './ids'
import type { Order } from './order'
import type { Rider } from './rider'
import type { MerchantProfile } from './profiles'

export interface LoginRequest {
  role: string
  username: string
  password: string
}

export interface RegisterRequest {
  role: string
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  username: string
  role: UserRole
}

export type MeResponse =
  | { username: string; role: 'customer'; customerAccount: CustomerAccountPublic }
  | { username: string; role: 'merchant'; merchantAccount: MerchantAccountPublic }
  | { username: string; role: 'rider'; riderAccount: RiderAccountPublic }
  | { username: string; role: 'admin'; adminAccount: AdminAccountPublic }

export interface OkResponse {
  ok: boolean
}

export interface CheckoutLine {
  merchantId: string
  productId: string
  quantity: number
}

export interface CheckoutRequest {
  lines: CheckoutLine[]
}

export interface CheckoutResponse {
  orders: Order[]
  walletBalance: number
}

export interface CustomerProfilePatchBody {
  walletBalance?: number
  defaultAddress?: string
  name?: string
  phone?: string
}

export interface MerchantProfileBody {
  profile: MerchantProfile
}

export interface CreateStoreRequest {
  storeName: string
  address: string
}

export interface CreateStoreResponse {
  ok: boolean
  merchantId: string
}

export interface CatalogResponse {
  merchants: Merchant[]
  products: Product[]
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

export interface ErrorBody {
  error: string
}
