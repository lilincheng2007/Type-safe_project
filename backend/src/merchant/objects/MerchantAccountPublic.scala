package delivery.merchant.objects

import delivery.model.MerchantProfile

final case class MerchantAccountPublic(role: String, username: String, profile: MerchantProfile)
