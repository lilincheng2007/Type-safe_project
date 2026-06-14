import { cancelOrderIO } from '@/apis/order/OrderCancelAPI'
import { completeOrderIO } from '@/apis/order/OrderCompleteAPI'
import { uploadOrderImageFileIO } from '@/apis/order/CustomerOrderImageFileAPI'
import { uploadRefundImageFileIO } from '@/apis/order/CustomerRefundImageFileAPI'
import { fetchOrderDetailIO } from '@/apis/order/OrderDetailAPI'
import { appealOrderRefundIO } from '@/apis/order/OrderRefundAppealAPI'
import { requestOrderRefundIO } from '@/apis/order/OrderRefundRequestAPI'
import { uploadReviewImageFileIO } from '@/apis/review/CustomerReviewImageFileAPI'
import { submitOrderReviewIO } from '@/apis/review/CustomerSubmitOrderReviewAPI'
import { voteMerchantReviewIO } from '@/apis/review/CustomerReviewVoteAPI'
import { fetchMerchantReviewsIO } from '@/apis/review/MerchantReviewsAPI'
import { runTask } from '@/apis/shared/client'

import type { CustomerPortalStore } from '../types'
import type { CustomerPortalGet, CustomerPortalSet } from './types'

export function createOrderReviewActions(
  set: CustomerPortalSet,
  get: CustomerPortalGet,
): Pick<CustomerPortalStore,
  | 'openOrderDetail'
  | 'cancelOrder'
  | 'completeOrder'
  | 'uploadRefundImage'
  | 'uploadOrderImage'
  | 'requestRefund'
  | 'appealRefund'
  | 'uploadReviewImage'
  | 'submitReview'
  | 'fetchMerchantReviews'
  | 'voteMerchantReview'
> {
  return {
    openOrderDetail: async (orderId) => {
      try {
        const order = await runTask(fetchOrderDetailIO(orderId))
        set({ selectedOrder: order })
        return { ok: true }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '订单详情加载失败' }
      }
    },

    cancelOrder: async (orderId) => {
      try {
        const data = await runTask(cancelOrderIO(orderId))
        await get().refreshPortal()
        set((state) => ({
          walletBalance: data.walletBalance,
          selectedOrder: state.selectedOrder?.id === orderId ? data.order : state.selectedOrder,
        }))
        return { ok: true }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '订单取消失败' }
      }
    },

    completeOrder: async (orderId) => {
      try {
        const order = await runTask(completeOrderIO(orderId))
        await get().refreshPortal()
        set((state) => ({
          selectedOrder: state.selectedOrder?.id === orderId ? order : state.selectedOrder,
          reviewTargetOrder: order,
        }))
        return { ok: true }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '确认完成失败' }
      }
    },

    uploadRefundImage: async (file) => {
      try {
        const imageUrl = await runTask(uploadRefundImageFileIO(file))
        return { ok: true, imageUrl }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '退款凭证上传失败' }
      }
    },

    uploadOrderImage: async (file) => {
      try {
        const imageUrl = await runTask(uploadOrderImageFileIO(file))
        return { ok: true, imageUrl }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '图片上传失败' }
      }
    },

    requestRefund: async (input) => {
      try {
        const data = await runTask(requestOrderRefundIO(input.orderId, input.reason, input.imageUrl))
        await get().refreshPortal()
        set((state) => ({
          selectedOrder: state.selectedOrder?.id === input.orderId ? data.order : state.selectedOrder,
        }))
        return { ok: true }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '退款申请提交失败' }
      }
    },

    appealRefund: async (orderId) => {
      try {
        const data = await runTask(appealOrderRefundIO(orderId))
        await get().refreshPortal()
        set((state) => ({
          selectedOrder: state.selectedOrder?.id === orderId ? data.order : state.selectedOrder,
        }))
        return { ok: true }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '提交管理员仲裁失败' }
      }
    },

    uploadReviewImage: async (file) => {
      try {
        const imageUrl = await runTask(uploadReviewImageFileIO(file))
        return { ok: true, imageUrl }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '图片上传失败' }
      }
    },

    submitReview: async (input) => {
      try {
        await runTask(submitOrderReviewIO(input))
        await get().refreshPortal()
        set({ reviewTargetOrder: null })
        return { ok: true }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '提交评价失败' }
      }
    },

    fetchMerchantReviews: async (merchantId) => runTask(fetchMerchantReviewsIO(merchantId)),

    voteMerchantReview: async (reviewId, vote) => {
      try {
        await runTask(voteMerchantReviewIO(reviewId, vote))
        return { ok: true }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '评价投票失败' }
      }
    },
  }
}
