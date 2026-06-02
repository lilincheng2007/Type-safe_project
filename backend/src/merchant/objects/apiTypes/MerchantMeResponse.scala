package delivery.merchant.objects.apiTypes

import delivery.merchant.objects.MerchantAccountPublic
import delivery.shared.objects.UserRole

final case class MerchantMeResponse(
    username: String,
    role: UserRole,
    merchantAccount: MerchantAccountPublic
)
