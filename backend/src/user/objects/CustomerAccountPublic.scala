package delivery.user.objects

import delivery.shared.objects.UserRole

final case class CustomerAccountPublic(role: UserRole, username: String, profile: CustomerProfile)
