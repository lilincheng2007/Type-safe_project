import { useState } from 'react'

import type { Order } from '@/objects/order/Order'

export type RefundReviewAction = 'accept' | 'reject'

export function useRefundReviewDialog() {
  const [reviewingRefund, setReviewingRefund] = useState<{ order: Order; action: RefundReviewAction } | null>(null)
  const [refundReviewReason, setRefundReviewReason] = useState('')

  const openRefundReviewDialog = (order: Order, action: RefundReviewAction) => {
    setReviewingRefund({ order, action })
    setRefundReviewReason('')
  }

  const closeRefundReviewDialog = () => {
    setReviewingRefund(null)
    setRefundReviewReason('')
  }

  return {
    reviewingRefund,
    refundReviewReason,
    setRefundReviewReason,
    openRefundReviewDialog,
    closeRefundReviewDialog,
  }
}
