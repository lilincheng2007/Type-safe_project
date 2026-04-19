package delivery.merchant.state

import delivery.merchant.objects.MerchantProfile

final case class MerchantAccount(
    role: String,
    username: String,
    password: String,
    profile: MerchantProfile
)
