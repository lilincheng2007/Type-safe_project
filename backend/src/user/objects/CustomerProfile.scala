package delivery.user.objects

import delivery.order.objects.Order
import delivery.shared.objects.Voucher

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
