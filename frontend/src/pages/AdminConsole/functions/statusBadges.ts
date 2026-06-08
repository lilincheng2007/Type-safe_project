import type { StoreOnboardingStatus } from '@/objects/admin/StoreOnboardingRequest'
import { RefundStatuses, type RefundStatus } from '@/objects/shared/ids'

export const statusLabels: Record<StoreOnboardingStatus, string> = {
  pending: '待审核',
  accepted: '已通过',
  rejected: '已驳回',
}

export const refundStatusLabels: Record<RefundStatus, string> = {
  [RefundStatuses.pending]: '待商家处理',
  [RefundStatuses.legacyPending]: '待商家处理',
  [RefundStatuses.merchantRejected]: '商家已驳回',
  [RefundStatuses.adminPending]: '待管理员仲裁',
  [RefundStatuses.accepted]: '已通过',
  [RefundStatuses.rejected]: '已驳回',
}

export function statusBadgeVariant(status: StoreOnboardingStatus) {
  if (status === 'accepted') return 'default'
  if (status === 'rejected') return 'destructive'
  return 'outline'
}

export function refundStatusBadgeVariant(status: RefundStatus | null | undefined) {
  if (status === RefundStatuses.accepted) return 'default'
  if (status === RefundStatuses.rejected || status === RefundStatuses.merchantRejected) return 'destructive'
  return 'outline'
}
