import type { AdminAccountPublic } from './AdminAccountPublic'

export interface AdminMeResponse {
  username: string
  role: 'admin'
  adminAccount: AdminAccountPublic
}
