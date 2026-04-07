package delivery.model

/** 与前端 `frontend/src/delivery/model/voucher.ts` 对齐 */

final case class Voucher(
    id: String,
    title: String,
    discountAmount: Double,
    minSpend: Double,
    expiresAt: String,
    remainingCount: Int
)
