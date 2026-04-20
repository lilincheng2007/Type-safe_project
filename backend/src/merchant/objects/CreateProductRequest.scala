package delivery.merchant.objects

final case class CreateProductRequest(
    merchantId: String,
    name: String,
    description: String,
    price: Double,
    remainingStock: Int,
    listingStatus: String
)
