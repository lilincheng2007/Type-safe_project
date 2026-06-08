import type { AIDietWeeklyReportResponse } from '@/objects/ai/apiTypes/AIDietWeeklyReportResponse'
import type { AIOrderProgressNarrativesResponse } from '@/objects/ai/apiTypes/AIOrderProgressNarrativesResponse'
import type { Merchant } from '@/objects/merchant/Merchant'
import type { Product } from '@/objects/merchant/Product'
import type { Order } from '@/objects/order/Order'
import type { MerchantId, OrderId, ProductId, VoucherId } from '@/objects/shared/ids'
import type { Voucher } from '@/objects/shared/Voucher'

export type ProfilePanel = 'main' | 'contacts' | 'pending' | 'history' | 'favorites' | 'coupons'

export type ProfileTabProps = {
  username: string
  walletBalance: number
  merchants: Merchant[]
  products: Product[]
  pendingOrders: Order[]
  historyOrders: Order[]
  vouchers: Voucher[]
  foodiePoints: number
  foodieLevel: number
  favoriteMerchantIds: MerchantId[]
  favoriteProductIds: ProductId[]
  aiDietReport: AIDietWeeklyReportResponse | null
  aiDietReportLoading: boolean
  aiDietReportError: string | null
  aiOrderProgressNarratives: AIOrderProgressNarrativesResponse | null
  onOpenRecharge: () => void
  onSelectOrder: (orderId: OrderId) => void
  onCompleteOrder: (orderId: OrderId) => void
  onAppealRefund: (orderId: OrderId) => void
  onReorderOrder: (orderId: OrderId) => void
  onGenerateAIDietReport: () => void
  onDiscardExpiredVoucher: (voucherId: VoucherId) => void
  onToggleMerchantFavorite: (merchantId: MerchantId) => void
  onToggleProductFavorite: (productId: ProductId) => void
}
