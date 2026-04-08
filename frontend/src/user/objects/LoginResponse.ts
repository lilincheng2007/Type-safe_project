import type { UserRole } from '@/delivery/model/ids'

export interface LoginResponse {
  token: string
  username: string
  role: UserRole
}
