import type { UserRole } from '@/objects/shared/ids'

export interface RegisterRequest {
  role: UserRole
  username: string
  password: string
}
