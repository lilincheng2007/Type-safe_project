import type { TaskIO } from '@/delivery/io/TaskIO'
import type { LoginResponse } from '@/objects/user/LoginResponse'
import type { UserRole } from '@/delivery/model/ids'
import { apiPostIO } from '@/api/shared/client'

export function loginIO(input: { role: UserRole; username: string; password: string }): TaskIO<LoginResponse> {
  return apiPostIO('/auth/login', input)
}
