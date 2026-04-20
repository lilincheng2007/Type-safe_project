package delivery.merchant.objects

final case class UpdateProductRequest(
    name: String,
    description: String,
    price: Double,
    remainingStock: Int,
    listingStatus: String
)
