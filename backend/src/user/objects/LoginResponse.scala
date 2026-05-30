package delivery.user.objects

import delivery.shared.objects.UserRole

final case class LoginResponse(token: String, username: String, role: UserRole)
