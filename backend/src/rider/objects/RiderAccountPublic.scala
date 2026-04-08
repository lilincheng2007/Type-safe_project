package delivery.rider.objects

import delivery.model.RiderProfile

final case class RiderAccountPublic(role: String, username: String, profile: RiderProfile)
