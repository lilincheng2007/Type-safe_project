package delivery.user.objects

import delivery.model.CustomerProfile

final case class CustomerAccountPublic(role: String, username: String, profile: CustomerProfile)
