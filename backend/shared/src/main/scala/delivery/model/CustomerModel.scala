package delivery.model

/** 与前端 `frontend/src/delivery/model/customer.ts` 对齐 */

final case class Customer(
    id: String,
    name: String,
    phone: String,
    defaultAddress: String,
    walletBalance: Double,
    orderHistoryIds: List[String],
    vouchers: List[Voucher]
)
