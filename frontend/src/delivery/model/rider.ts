/** 与后端 `RiderModel.scala` 对齐 */

import type { RiderId, RiderStatus } from './ids'

export interface Rider {
  id: RiderId
  name: string
  phone: string
  realtimeLocation: string
  status: RiderStatus
  totalOrders: number
  rating: number
  station: string
  salary: number
}
