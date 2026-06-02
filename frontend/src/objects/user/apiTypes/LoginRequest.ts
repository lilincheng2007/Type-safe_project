import type { UserRole } from '@/objects/shared/ids'

export interface LoginRequest {
  role: UserRole
  username: string
  password: string
}
