package delivery.user.objects.apiTypes

import delivery.shared.objects.UserRole
import delivery.user.objects.CustomerAccountPublic

final case class CustomerMeResponse(
    username: String,
    role: UserRole,
    customerAccount: CustomerAccountPublic
)
