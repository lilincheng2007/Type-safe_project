import type { ComplaintTicket } from './ComplaintTicket'
import type { CustomerServiceAgent } from './CustomerServiceAgent'
import type { MerchantApplication } from './MerchantApplication'
import type { OperationsManager } from './OperationsManager'
import type { PromotionCampaign } from './PromotionCampaign'

export interface PlatformMetaResponse {
  campaigns: PromotionCampaign[]
  complaintTickets: ComplaintTicket[]
  merchantApplications: MerchantApplication[]
  serviceAgents: CustomerServiceAgent[]
  operationsManagers: OperationsManager[]
}
