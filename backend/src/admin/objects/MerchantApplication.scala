package delivery.admin.objects

final case class MerchantApplication(
    id: String,
    applicantName: String,
    storeName: String,
    category: String,
    region: String,
    status: String
)
