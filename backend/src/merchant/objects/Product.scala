package delivery.merchant.objects

final case class Product(
    id: String,
    merchantId: String,
    name: String,
    price: Double,
    description: String,
    imageUrl: String,
    monthlySales: Int,
    remainingStock: Int,
    listingStatus: String,
    inventoryStatus: String,
    discountText: Option[String] = None
)
