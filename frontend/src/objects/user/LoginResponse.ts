import type { UserRole } from '@/objects/shared/ids'

export interface LoginResponse {
  token: string
  username: string
  role: UserRole
}
