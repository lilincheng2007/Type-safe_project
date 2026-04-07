package delivery.model

/** 与前端 `frontend/src/delivery/model/platform.ts` 对齐 */

final case class CustomerServiceAgent(
    id: String,
    name: String,
    department: String,
    channel: String,
    ticketIds: List[String]
)

final case class OperationsManager(
    id: String,
    name: String,
    region: String,
    managedMerchantIds: List[String],
    campaignPlans: List[String]
)

final case class MerchantApplication(
    id: String,
    applicantName: String,
    storeName: String,
    category: String,
    region: String,
    status: String
)

final case class ComplaintTicket(
    id: String,
    orderId: String,
    customerName: String,
    summary: String,
    severity: String,
    status: String
)

final case class PromotionCampaign(
    id: String,
    title: String,
    target: String,
    status: String
)
