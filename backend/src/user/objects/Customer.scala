package delivery.user.objects

import delivery.shared.objects.Voucher

final case class Customer(
    id: String,
    name: String,
    phone: String,
    defaultAddress: String,
    walletBalance: Double,
    orderHistoryIds: List[String],
    vouchers: List[Voucher]
)
