import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { UserRole } from '@/objects/shared/ids'
import type { LoginRequest } from '@/objects/user/apiTypes/LoginRequest'
import type { LoginResponse } from '@/objects/user/apiTypes/LoginResponse'

class LoginAPI extends APIMessage<LoginResponse> {
  readonly apiName = 'loginapi'
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

export function loginIO(input: LoginRequest): TaskIO<LoginResponse> {
  return sendAPI(new LoginAPI(input.role, input.username, input.password))
}
