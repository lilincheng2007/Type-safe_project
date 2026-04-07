/**
 * 对应后端 **rider-service**。
 * 当前无独立业务路径；会话与档案与 GET /auth/me 一致（经网关转发至 rider-service）。
 */
import type { TaskIO } from '@/delivery/io/TaskIO'
import type { MeResponse } from '@/delivery/model/api'
import { fetchMeIO } from './user-service'

export function fetchRiderMeIO(): TaskIO<MeResponse> {
  return fetchMeIO()
}
