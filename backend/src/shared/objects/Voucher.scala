package delivery.shared.objects

final case class Voucher(
    id: String,
    title: String,
    discountAmount: Double,
    minSpend: Double,
    expiresAt: String,
    remainingCount: Int
)
