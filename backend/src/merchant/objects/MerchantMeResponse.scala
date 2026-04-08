package delivery.merchant.objects

final case class MerchantMeResponse(
    username: String,
    role: String,
    merchantAccount: MerchantAccountPublic
)
