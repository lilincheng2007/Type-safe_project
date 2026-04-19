package delivery.merchant.objects

import delivery.order.objects.Order

final case class MerchantStoreProfile(
    merchant: Merchant,
    products: List[Product],
    pendingOrders: List[Order],
    historyOrders: List[Order]
)
