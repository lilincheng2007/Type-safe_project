package delivery.merchant.objects.apiTypes

import delivery.shared.objects.ListingStatus

final case class UpdateProductRequest(
    name: String,
    description: String,
    price: Double,
    remainingStock: Int,
    listingStatus: ListingStatus
)
