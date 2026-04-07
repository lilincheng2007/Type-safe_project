/**
 * 对应后端 **user-service**（认证、顾客档案；GET /auth/me 在网关中按角色转发）。
 */
import type { TaskIO } from '@/delivery/io/TaskIO'
import type { CustomerProfilePatchBody, LoginResponse, MeResponse, OkResponse } from '@/delivery/model/api'
import type { UserRole } from '@/delivery/model/ids'
import { apiGetIO, apiPatchIO, apiPostIO } from '../client'
import { gatewayPaths } from '../gateway-paths'

const { auth, delivery } = gatewayPaths

export function loginIO(input: { role: UserRole; username: string; password: string }): TaskIO<LoginResponse> {
  return apiPostIO(auth.login, input)
}

export function registerIO(input: {
  role: Exclude<UserRole, 'admin'>
  username: string
  password: string
}): TaskIO<OkResponse> {
  return apiPostIO(auth.register, input)
}

/** 经网关：顾客 / 商户 / 骑手 / 管理员各自由对应后端服务响应 */
export function fetchMeIO(): TaskIO<MeResponse> {
  return apiGetIO(auth.me)
}

export function patchCustomerProfileIO(patch: CustomerProfilePatchBody): TaskIO<OkResponse> {
  return apiPatchIO(delivery.customerProfile, patch)
}
