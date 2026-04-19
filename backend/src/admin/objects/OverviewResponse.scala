package delivery.admin.objects

import delivery.merchant.objects.Merchant
import delivery.order.objects.Order
import delivery.rider.objects.Rider

final case class OverviewResponse(
    merchants: List[Merchant],
    orders: List[Order],
    riders: List[Rider],
    campaigns: List[PromotionCampaign],
    complaintTickets: List[ComplaintTicket]
)
