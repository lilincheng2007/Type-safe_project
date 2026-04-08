import type { CampaignId } from '@/delivery/model/ids'

export interface PromotionCampaign {
  id: CampaignId
  title: string
  target: '新客' | '全体用户' | '指定商家'
  status: '草稿' | '进行中' | '已结束'
}
