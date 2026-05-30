package delivery.user.objects

import delivery.shared.objects.UserRole

final case class CustomerMeResponse(
    username: String,
    role: UserRole,
    customerAccount: CustomerAccountPublic
)
