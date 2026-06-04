package delivery.admin.objects

final case class StoreOnboardingRequest(
    id: String,
    ownerUsername: String,
    storeName: String,
    address: String,
    description: String,
    status: String,
    rejectionReason: Option[String],
    reviewedBy: Option[String],
    createdAt: String,
    reviewedAt: Option[String]
)
