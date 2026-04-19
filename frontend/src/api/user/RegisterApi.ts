import type { TaskIO } from '@/api/shared/TaskIO'
import type { OkResponse } from '@/objects/shared/OkResponse'
import type { UserRole } from '@/objects/shared/ids'
import { apiPostIO } from '@/api/shared/client'

export function registerIO(input: {
  role: Exclude<UserRole, 'admin'>
  username: string
  password: string
}): TaskIO<OkResponse> {
  return apiPostIO('/user/register', input)
}
