package delivery.merchant.objects

final case class MerchantProfile(
    id: String,
    ownerName: String,
    phone: String,
    stores: List[MerchantStoreProfile]
)
