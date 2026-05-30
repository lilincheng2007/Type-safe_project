package delivery.merchant.objects

import delivery.shared.objects.UserRole

final case class MerchantAccountPublic(role: UserRole, username: String, profile: MerchantProfile)
