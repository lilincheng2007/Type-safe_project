package delivery.admin.objects

final case class OperationsManager(
    id: String,
    name: String,
    region: String,
    managedMerchantIds: List[String],
    campaignPlans: List[String]
)
