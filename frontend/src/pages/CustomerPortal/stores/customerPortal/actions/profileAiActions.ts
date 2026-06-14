import { aiDietWeeklyReportIO } from '@/apis/ai/AIDietWeeklyReportAPI'
import { runTask } from '@/apis/shared/client'
import { discardCustomerVoucherIO } from '@/apis/user/CustomerVoucherDiscardAPI'
import { patchCustomerProfileIO } from '@/apis/user/CustomerProfilePatchAPI'
import { rechargeCustomerWalletIO } from '@/apis/user/CustomerRechargeAPI'
import { validateDeliveryContacts } from '@/lib/deliveryContacts'

import type { CustomerPortalStore } from '../types'
import type { CustomerPortalGet, CustomerPortalSet } from './types'

export function createProfileAiActions(
  set: CustomerPortalSet,
  get: CustomerPortalGet,
): Pick<CustomerPortalStore, 'recharge' | 'discardExpiredVoucher' | 'saveDeliveryContacts' | 'generateAIDietReport'> {
  return {
    recharge: async () => {
      const { rechargeAmountInput } = get()
      const amount = Number.parseFloat(rechargeAmountInput)

      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, message: '请输入有效的充值金额。' }
      }

      try {
        const data = await runTask(rechargeCustomerWalletIO({ amount }))
        await get().refreshPortal()
        set({
          walletBalance: data.walletBalance,
          rechargeAmountInput: '',
          isRechargeOpen: false,
        })
        return { ok: true, amount }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '充值同步失败' }
      }
    },

    discardExpiredVoucher: async (voucherId) => {
      try {
        await runTask(discardCustomerVoucherIO(voucherId))
        await get().refreshPortal()
        return { ok: true }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '优惠券舍弃失败' }
      }
    },

    saveDeliveryContacts: async (contacts) => {
      const message = validateDeliveryContacts(contacts)
      if (message) {
        return { ok: false, message }
      }
      try {
        await runTask(patchCustomerProfileIO({ deliveryContacts: contacts }))
        await get().refreshPortal()
        return { ok: true }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '收货信息保存失败' }
      }
    },

    generateAIDietReport: async () => {
      set({ aiDietReportLoading: true, aiDietReportError: null })
      try {
        const result = await runTask(aiDietWeeklyReportIO({}))
        set({ aiDietReport: result, aiDietReportLoading: false })
        return { ok: true }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'AI 周报生成失败'
        set({ aiDietReportError: errorMessage, aiDietReportLoading: false })
        return { ok: false, message: errorMessage }
      }
    },
  }
}
