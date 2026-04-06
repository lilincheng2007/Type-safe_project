import type { UserRole } from '@/domain-types'
import type {
  AdminAccountPublic,
  CustomerAccountPublic,
  MerchantAccountPublic,
  RiderAccountPublic,
} from '@/domain-types/accounts'
import { apiGet, apiPost } from '@/lib/api/client'

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

export function loginApi(input: { role: UserRole; username: string; password: string }) {
  return apiPost<LoginResponse>('/auth/login', input)
}

export function registerApi(input: { role: Exclude<UserRole, 'admin'>; username: string; password: string }) {
  return apiPost<{ ok: boolean }>('/auth/register', input)
}

export function fetchMe() {
  return apiGet<MeResponse>('/auth/me')
}
