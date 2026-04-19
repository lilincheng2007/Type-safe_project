import type { TaskIO } from '@/api/shared/TaskIO'
import type { LoginResponse } from '@/objects/user/LoginResponse'
import type { UserRole } from '@/objects/shared/ids'
import { apiPostIO } from '@/api/shared/client'

export function loginIO(input: { role: UserRole; username: string; password: string }): TaskIO<LoginResponse> {
  return apiPostIO('/user/login', input)
}
