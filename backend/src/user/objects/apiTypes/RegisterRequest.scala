package delivery.user.objects.apiTypes

import delivery.shared.objects.UserRole

final case class RegisterRequest(role: UserRole, username: String, password: String)
