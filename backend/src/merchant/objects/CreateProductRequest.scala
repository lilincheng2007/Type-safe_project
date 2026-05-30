package delivery.merchant.objects

import delivery.shared.objects.{ListingStatus, MerchantId}

final case class CreateProductRequest(
    merchantId: MerchantId,
    name: String,
    description: String,
    price: Double,
    remainingStock: Int,
    listingStatus: ListingStatus
)
