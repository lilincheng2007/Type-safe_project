import type { OrderId } from '@/objects/shared/ids'
import type { MerchantStoreProfile } from '@/objects/merchant/MerchantStoreProfile'

export type OrdersTabProps = {
  selectedStore: MerchantStoreProfile | null
  onAcceptOrder: (orderId: OrderId, prepMinutes?: number) => void
  onRejectOrder: (orderId: OrderId) => void
  onFinishCooking: (orderId: OrderId) => void
  onDelayPrep: (orderId: OrderId, extraMinutes: number, reason: string) => void
}
