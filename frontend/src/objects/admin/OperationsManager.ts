import type { MerchantId, OperationsManagerId } from '@/objects/shared/ids'

export interface OperationsManager {
  id: OperationsManagerId
  name: string
  region: string
  managedMerchantIds: MerchantId[]
  campaignPlans: string[]
}
