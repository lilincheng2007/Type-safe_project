import { UserRoles } from '@/objects/shared/ids'
import type { UserRole } from '@/objects/shared/ids'
import type { RiderProfile } from './RiderProfile'

export interface RiderAccountPublic {
  role: typeof UserRoles.rider & UserRole
  username: string
  profile: RiderProfile
}
