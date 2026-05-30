import { UserRoles } from '@/objects/shared/ids'
import type { UserRole } from '@/objects/shared/ids'
import type { Order } from '@/objects/order/Order'
import type { RiderAccountPublic } from './RiderAccountPublic'

export interface RiderMeResponse {
  username: string
  role: typeof UserRoles.rider & UserRole
  riderAccount: RiderAccountPublic
  availableOrders: Order[]
}
