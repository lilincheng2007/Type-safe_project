import type { RiderId, RiderStatus } from '@/delivery/model/ids'

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
