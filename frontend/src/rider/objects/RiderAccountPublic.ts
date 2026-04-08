import type { RiderProfile } from './RiderProfile'

export interface RiderAccountPublic {
  role: 'rider'
  username: string
  profile: RiderProfile
}
