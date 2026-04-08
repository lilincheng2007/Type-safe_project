import type { Merchant } from '@/merchant/objects/Merchant'
import type { Order } from '@/order/objects/Order'
import type { Rider } from '@/rider/objects/Rider'
import type { PromotionCampaign } from './PromotionCampaign'
import type { ComplaintTicket } from './ComplaintTicket'

export interface OverviewResponse {
  merchants: Merchant[]
  orders: Order[]
  riders: Rider[]
  campaigns: PromotionCampaign[]
  complaintTickets: ComplaintTicket[]
}
