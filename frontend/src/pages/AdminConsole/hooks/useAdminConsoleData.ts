import { useEffect, useMemo, useState } from 'react'

import { fetchAdminOrderMonitorIO } from '@/apis/admin/AdminOrderMonitorAPI'
import { fetchAdminPlatformPromotionsIO } from '@/apis/admin/AdminPlatformPromotionsAPI'
import { acceptRefundRequestIO } from '@/apis/admin/AdminRefundAcceptAPI'
import { fetchAdminRefundRequestsIO } from '@/apis/admin/AdminRefundRequestsAPI'
import { rejectRefundRequestIO } from '@/apis/admin/AdminRefundRejectAPI'
import { acceptStoreOnboardingRequestIO } from '@/apis/admin/AdminStoreOnboardingAcceptAPI'
import { fetchAdminStoreOnboardingRequestsIO } from '@/apis/admin/AdminStoreOnboardingRequestsAPI'
import { rejectStoreOnboardingRequestIO } from '@/apis/admin/AdminStoreOnboardingRejectAPI'
import { runTask } from '@/apis/shared/client'
import type { AppChromeContextValue } from '@/lib/app-chrome-context'
import type { StoreOnboardingRequest } from '@/objects/admin/StoreOnboardingRequest'
import type { AdminOrderMonitorResponse } from '@/objects/admin/apiTypes/AdminOrderMonitorResponse'
import type { Order } from '@/objects/order/Order'
import { RefundStatuses } from '@/objects/shared/ids'
import type { Promotion } from '@/objects/shared/Promotion'

import { CollapsedListLimit } from '../functions/adminFormatters'
import { useRefundReviewDialog } from './useRefundReviewDialog'

type ShowNotice = AppChromeContextValue['showNotice']

export function useAdminConsoleData(showNotice: ShowNotice) {
  const [requests, setRequests] = useState<StoreOnboardingRequest[]>([])
  const [refundRequests, setRefundRequests] = useState<Order[]>([])
  const [orderMonitor, setOrderMonitor] = useState<AdminOrderMonitorResponse | null>(null)
  const [platformPromotions, setPlatformPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [orderMonitorError, setOrderMonitorError] = useState<string | null>(null)
  const [platformPromotionsError, setPlatformPromotionsError] = useState<string | null>(null)
  const [rejectingRequest, setRejectingRequest] = useState<StoreOnboardingRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showAllOnboardingRequests, setShowAllOnboardingRequests] = useState(false)
  const [showAllRefundRequests, setShowAllRefundRequests] = useState(false)

  const {
    reviewingRefund,
    refundReviewReason,
    setRefundReviewReason,
    openRefundReviewDialog,
    closeRefundReviewDialog,
  } = useRefundReviewDialog()

  const pendingCount = useMemo(() => requests.filter((request) => request.status === 'pending').length, [requests])
  const refundPendingCount = useMemo(
    () => refundRequests.filter((order) => order.refundStatus === RefundStatuses.adminPending).length,
    [refundRequests],
  )

  const displayedRequests = showAllOnboardingRequests ? requests : requests.slice(0, CollapsedListLimit)
  const displayedRefundRequests = showAllRefundRequests ? refundRequests : refundRequests.slice(0, CollapsedListLimit)

  const loadRequests = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    setOrderMonitorError(null)
    setPlatformPromotionsError(null)
    try {
      const [response, refundResponse, monitorResponse] = await Promise.all([
        runTask(fetchAdminStoreOnboardingRequestsIO()),
        runTask(fetchAdminRefundRequestsIO()),
        runTask(fetchAdminOrderMonitorIO()),
      ])
      setRequests(response.requests)
      setRefundRequests(refundResponse.requests)
      setOrderMonitor(monitorResponse)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '加载审核申请失败')
      setOrderMonitorError(error instanceof Error ? error.message : '加载订单监控失败')
    } finally {
      setIsLoading(false)
    }

    try {
      const promotionResponse = await runTask(fetchAdminPlatformPromotionsIO())
      setPlatformPromotions(promotionResponse.promotions)
      setPlatformPromotionsError(null)
    } catch (error) {
      setPlatformPromotionsError(error instanceof Error ? error.message : '加载平台优惠失败')
    }
  }

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId)
    try {
      await runTask(acceptStoreOnboardingRequestIO(requestId))
      showNotice('店铺申请已通过。', 'success')
      await loadRequests()
    } catch (error) {
      showNotice(error instanceof Error ? error.message : '通过申请失败', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectingRequest) return
    if (!rejectionReason.trim()) {
      showNotice('请填写驳回原因。', 'error')
      return
    }

    setProcessingId(rejectingRequest.id)
    try {
      await runTask(rejectStoreOnboardingRequestIO(rejectingRequest.id, rejectionReason.trim()))
      showNotice('店铺申请已驳回。', 'success')
      setRejectingRequest(null)
      setRejectionReason('')
      await loadRequests()
    } catch (error) {
      showNotice(error instanceof Error ? error.message : '驳回申请失败', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRefundReview = async () => {
    if (!reviewingRefund) return
    const reason = refundReviewReason.trim()

    if (reviewingRefund.action === 'reject' && !reason) {
      showNotice('请填写退款驳回原因。', 'error')
      return
    }

    setProcessingId(reviewingRefund.order.id)
    try {
      if (reviewingRefund.action === 'accept') {
        await runTask(acceptRefundRequestIO(reviewingRefund.order.id, reason || null))
        showNotice('退款已通过，款项已退回顾客钱包。', 'success')
      } else {
        await runTask(rejectRefundRequestIO(reviewingRefund.order.id, reason))
        showNotice('退款申请已驳回。', 'success')
      }
      closeRefundReviewDialog()
      await loadRequests()
    } catch (error) {
      showNotice(error instanceof Error ? error.message : '退款审核失败', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  useEffect(() => {
    void loadRequests()
  }, [])

  return {
    requests,
    refundRequests,
    orderMonitor,
    platformPromotions,
    isLoading,
    errorMessage,
    orderMonitorError,
    platformPromotionsError,
    rejectingRequest,
    rejectionReason,
    processingId,
    showAllOnboardingRequests,
    showAllRefundRequests,
    reviewingRefund,
    refundReviewReason,
    pendingCount,
    refundPendingCount,
    displayedRequests,
    displayedRefundRequests,
    setRejectingRequest,
    setRejectionReason,
    setShowAllOnboardingRequests,
    setShowAllRefundRequests,
    setRefundReviewReason,
    openRefundReviewDialog,
    closeRefundReviewDialog,
    loadRequests,
    handleAccept,
    handleReject,
    handleRefundReview,
  }
}
