package delivery.user.objects

import delivery.shared.objects.UserRole

final case class LoginRequest(role: UserRole, username: String, password: String)
