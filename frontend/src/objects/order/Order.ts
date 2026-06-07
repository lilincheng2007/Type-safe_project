import type { MerchantId, OrderId, RiderId, UserId, OrderStatus, RefundStatus } from '@/objects/shared/ids'
import type { Promotion } from '@/objects/shared/Promotion'
import type { Voucher } from '@/objects/shared/Voucher'

import type { OrderItem } from './OrderItem'
import type { OrderPriceBreakdown } from './OrderPriceBreakdown'
import type { OrderPriceSnapshot } from './OrderPriceSnapshot'
import type { OrderTimelineEvent } from './OrderTimelineEvent'

export interface Order {
  id: OrderId
  customerId: UserId
  customerName: string
  customerPhone: string
  merchantId: MerchantId
  riderId?: RiderId
  items: OrderItem[]
  totalAmount: number
  deliveryAddress: string
  status: OrderStatus
  placedAt: string
  originalAmount: number
  discountAmount: number
  payableAmount: number
  usedVoucher?: Voucher
  merchantDiscountAmount?: number
  platformDiscountAmount?: number
  merchantReceivableAmount?: number
  appliedPromotions?: Promotion[]
  priceSnapshot?: OrderPriceSnapshot | null
  priceBreakdown?: OrderPriceBreakdown | null
  pointsAwarded: number
  refundStatus?: RefundStatus | null
  refundReason?: string | null
  refundImageUrl?: string | null
  refundRequestedAt?: string | null
  refundMerchantReason?: string | null
  refundMerchantReviewedAt?: string | null
  refundAdminReason?: string | null
  refundedAt?: string | null
  customerNoteText?: string | null
  customerNoteImageUrl?: string | null
  statusTimeline?: OrderTimelineEvent[]
  estimatedPrepMinutes?: number | null
  estimatedReadyAt?: string | null
  prepDelayReason?: string | null
  prepDelayedAt?: string | null
  prepTimeoutNotifiedAt?: string | null
}
