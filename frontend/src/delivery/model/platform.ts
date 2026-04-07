/** 与后端 `PlatformModels.scala` 对齐 */

import type {
  CampaignId,
  CustomerServiceAgentId,
  MerchantCategory,
  MerchantId,
  OperationsManagerId,
  OrderId,
  ServiceChannel,
} from './ids'

export interface CustomerServiceAgent {
  id: CustomerServiceAgentId
  name: string
  department: string
  channel: ServiceChannel
  ticketIds: string[]
}

export interface OperationsManager {
  id: OperationsManagerId
  name: string
  region: string
  managedMerchantIds: MerchantId[]
  campaignPlans: string[]
}

export interface MerchantApplication {
  id: string
  applicantName: string
  storeName: string
  category: MerchantCategory
  region: string
  status: '待审核' | '已通过' | '已拒绝'
}

export interface ComplaintTicket {
  id: string
  orderId: OrderId
  customerName: string
  summary: string
  severity: '低' | '中' | '高'
  status: '待处理' | '处理中' | '已解决'
}

export interface PromotionCampaign {
  id: CampaignId
  title: string
  target: '新客' | '全体用户' | '指定商家'
  status: '草稿' | '进行中' | '已结束'
}
