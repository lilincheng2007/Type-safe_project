import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { UserRole } from '@/objects/shared/ids'
import type { RegisterRequest } from '@/objects/user/apiTypes/RegisterRequest'
import type { OkResponse } from '@/objects/shared/apiTypes/OkResponse'

class RegisterAPI extends APIMessage<OkResponse> {
  readonly apiName = 'registerapi'
  readonly role: UserRole
  readonly username: string
  readonly password: string

  constructor(role: UserRole, username: string, password: string) {
    super()
    this.role = role
    this.username = username
    this.password = password
  }
}

export function registerIO(input: RegisterRequest): TaskIO<OkResponse> {
  return sendAPI(new RegisterAPI(input.role, input.username, input.password))
}
