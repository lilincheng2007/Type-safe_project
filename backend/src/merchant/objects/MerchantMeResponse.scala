package delivery.merchant.objects

import delivery.shared.objects.UserRole

final case class MerchantMeResponse(
    username: String,
    role: UserRole,
    merchantAccount: MerchantAccountPublic
)
