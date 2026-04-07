package delivery.model

/** 与前端 `frontend/src/delivery/model/catalog.ts` 对齐 */

final case class Product(
    id: String,
    merchantId: String,
    name: String,
    price: Double,
    description: String,
    imageUrl: String,
    monthlySales: Int,
    inventoryStatus: String,
    discountText: Option[String] = None
)

final case class Merchant(
    id: String,
    storeName: String,
    category: String,
    address: String,
    phone: String,
    rating: Double,
    tags: List[String],
    featuredProductIds: List[String]
)
