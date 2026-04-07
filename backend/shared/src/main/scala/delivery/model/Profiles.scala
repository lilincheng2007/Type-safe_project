package delivery.model

/** 与前端 `frontend/src/delivery/model/profiles.ts` 对齐 */

final case class CustomerProfile(
    id: String,
    name: String,
    phone: String,
    defaultAddress: String,
    vouchers: List[Voucher],
    walletBalance: Double,
    pendingOrders: List[Order],
    historyOrders: List[Order]
)

final case class MerchantStoreProfile(
    merchant: Merchant,
    products: List[Product],
    pendingOrders: List[Order],
    historyOrders: List[Order]
)

final case class MerchantProfile(
    id: String,
    ownerName: String,
    phone: String,
    stores: List[MerchantStoreProfile]
)

final case class RiderProfile(
    rider: Rider,
    walletBalance: Double,
    pendingOrders: List[Order],
    historyOrders: List[Order]
)
