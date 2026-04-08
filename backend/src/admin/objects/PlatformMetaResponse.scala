package delivery.admin.objects

import delivery.model.{ComplaintTicket, CustomerServiceAgent, MerchantApplication, OperationsManager, PromotionCampaign}

final case class PlatformMetaResponse(
    campaigns: List[PromotionCampaign],
    complaintTickets: List[ComplaintTicket],
    merchantApplications: List[MerchantApplication],
    serviceAgents: List[CustomerServiceAgent],
    operationsManagers: List[OperationsManager]
)
