import type { OrderId, RiderId, UserId } from '@/objects/shared/ids'

export interface RiderReview {
  id: string
  orderId: OrderId
  riderId: RiderId
  customerId: UserId
  customerName: string
  rating: number
  createdAt: string
}
