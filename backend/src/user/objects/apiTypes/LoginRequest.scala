package delivery.user.objects.apiTypes

import delivery.shared.objects.UserRole

final case class LoginRequest(role: UserRole, username: String, password: String)
