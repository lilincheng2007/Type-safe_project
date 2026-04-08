import type { TaskIO } from '@/delivery/io/TaskIO'
import type { OkResponse } from '@/shared/objects/OkResponse'
import type { UserRole } from '@/delivery/model/ids'
import { apiPostIO } from '@/shared/http/client'

export function registerIO(input: {
  role: Exclude<UserRole, 'admin'>
  username: string
  password: string
}): TaskIO<OkResponse> {
  return apiPostIO('/auth/register', input)
}
