package delivery.model

/** 与前端仅概念对齐（应用聚合状态；前端无同名单文件，见各实体模块） */

final case class AppState(
    customers: List[Customer],
    catalogMerchants: List[Merchant],
    catalogProducts: List[Product],
    riders: List[Rider],
    orders: List[Order],
    accountStore: AccountStore,
    serviceAgents: List[CustomerServiceAgent],
    operationsManagers: List[OperationsManager],
    merchantApplications: List[MerchantApplication],
    complaintTickets: List[ComplaintTicket],
    campaigns: List[PromotionCampaign]
)
