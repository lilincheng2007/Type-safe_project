import type { TaskIO } from '@/delivery/io/TaskIO'
import type { OkResponse } from '@/objects/shared/OkResponse'
import type { UserRole } from '@/delivery/model/ids'
import { apiPostIO } from '@/api/shared/client'

export function registerIO(input: {
  role: Exclude<UserRole, 'admin'>
  username: string
  password: string
}): TaskIO<OkResponse> {
  return apiPostIO('/auth/register', input)
}
