package delivery.admin.objects

import delivery.model.{ComplaintTicket, Merchant, Order, PromotionCampaign, Rider}

final case class OverviewResponse(
    merchants: List[Merchant],
    orders: List[Order],
    riders: List[Rider],
    campaigns: List[PromotionCampaign],
    complaintTickets: List[ComplaintTicket]
)
