package delivery.shared.objects

final case class Voucher(
    id: VoucherId,
    title: String,
    discountAmount: Double,
    minSpend: Double,
    expiresAt: String,
    remainingCount: Int
)
