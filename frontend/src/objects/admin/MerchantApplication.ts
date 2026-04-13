import type { MerchantCategory } from '@/delivery/model/ids'

export interface MerchantApplication {
  id: string
  applicantName: string
  storeName: string
  category: MerchantCategory
  region: string
  status: '待审核' | '已通过' | '已拒绝'
}
