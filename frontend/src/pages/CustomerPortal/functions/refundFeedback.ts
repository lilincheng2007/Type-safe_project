import type { Order } from '@/objects/order/Order'
import { RefundStatuses } from '@/objects/shared/ids'

export const getRefundFeedback = (order: Order) => {
  if (order.refundStatus === RefundStatuses.accepted) {
    return {
      title: '退款已通过',
      message: order.refundAdminReason?.trim() || order.refundMerchantReason?.trim() || '退款申请已通过，款项已退回钱包。',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    }
  }
  if (order.refundStatus === RefundStatuses.rejected) {
    return {
      title: '退款已驳回',
      message: order.refundAdminReason?.trim() || '管理员已驳回退款申请。',
      className: 'border-rose-200 bg-rose-50 text-rose-700',
    }
  }
  if (order.refundStatus === RefundStatuses.merchantRejected) {
    return {
      title: '商家已驳回',
      message: order.refundMerchantReason?.trim() || '商家已驳回退款申请，可提交管理员仲裁。',
      className: 'border-rose-200 bg-rose-50 text-rose-700',
    }
  }
  if (order.refundStatus === RefundStatuses.adminPending) {
    return {
      title: '管理员仲裁中',
      message: '退款申请已提交管理员仲裁，请等待处理结果。',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    }
  }
  if (order.refundStatus === RefundStatuses.pending || order.refundStatus === RefundStatuses.legacyPending) {
    return {
      title: '等待商家处理',
      message: '退款申请已提交给商家，超过30分钟未处理将自动通过。',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    }
  }
  return null
}
