import type { Merchant } from '@/objects/merchant/Merchant'
import type { Order } from '@/objects/order/Order'
import type { Rider } from '@/objects/rider/Rider'
import type { PromotionCampaign } from './PromotionCampaign'
import type { ComplaintTicket } from './ComplaintTicket'

export interface OverviewResponse {
  merchants: Merchant[]
  orders: Order[]
  riders: Rider[]
  campaigns: PromotionCampaign[]
  complaintTickets: ComplaintTicket[]
}
