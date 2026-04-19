package delivery.admin.objects

final case class PlatformMetaResponse(
    campaigns: List[PromotionCampaign],
    complaintTickets: List[ComplaintTicket],
    merchantApplications: List[MerchantApplication],
    serviceAgents: List[CustomerServiceAgent],
    operationsManagers: List[OperationsManager]
)
