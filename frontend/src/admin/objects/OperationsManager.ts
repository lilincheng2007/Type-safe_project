import type { MerchantId, OperationsManagerId } from '@/delivery/model/ids'

export interface OperationsManager {
  id: OperationsManagerId
  name: string
  region: string
  managedMerchantIds: MerchantId[]
  campaignPlans: string[]
}
