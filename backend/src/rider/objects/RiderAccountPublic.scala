package delivery.rider.objects

import delivery.shared.objects.UserRole

final case class RiderAccountPublic(role: UserRole, username: String, profile: RiderProfile)
