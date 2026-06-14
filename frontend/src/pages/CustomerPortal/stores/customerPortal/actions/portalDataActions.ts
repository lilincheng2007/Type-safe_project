import { aiOrderProgressNarrativesIO } from '@/apis/ai/AIOrderProgressNarrativesAPI'
import { fetchCatalogIO } from '@/apis/merchant/CatalogAPI'
import { fetchCustomerOrdersIO } from '@/apis/order/CustomerOrdersAPI'
import { runTask } from '@/apis/shared/client'
import { fetchCustomerMeIO } from '@/apis/user/CustomerMeAPI'

import type { CustomerPortalStore } from '../types'
import { getLocalDateKey, resolveSelectedMerchantId } from '../helpers'
import type { CustomerPortalGet, CustomerPortalSet } from './types'
import { normalizeCartLines } from '@/lib/cart-inventory'

let refreshPortalInFlight: Promise<void> | null = null

export function createPortalDataActions(
  set: CustomerPortalSet,
  get: CustomerPortalGet,
): Pick<CustomerPortalStore, 'refreshPortal' | 'ensureAIOrderProgressNarratives' | 'bootstrap'> {
  return {
    refreshPortal: async () => {
      if (refreshPortalInFlight) {
        return refreshPortalInFlight
      }

      refreshPortalInFlight = (async () => {
        const [me, catalog, orders] = await Promise.all([
          runTask(fetchCustomerMeIO()),
          runTask(fetchCatalogIO()),
          runTask(fetchCustomerOrdersIO()),
        ])
        const currentSelectedMerchantId = get().selectedMerchantId
        const nextSelectedMerchantId = resolveSelectedMerchantId(currentSelectedMerchantId, catalog.merchants)
        const nextCartLines = normalizeCartLines(get().cartLines, catalog.products)

        set({
          customerAccount: me.customerAccount,
          walletBalance: me.customerAccount.profile.walletBalance,
          pendingOrders: orders.pendingOrders,
          historyOrders: orders.historyOrders,
          merchants: catalog.merchants,
          products: catalog.products,
          platformPromotions: catalog.platformPromotions ?? [],
          selectedMerchantId: nextSelectedMerchantId,
          cartLines: nextCartLines,
        })
      })()

      try {
        await refreshPortalInFlight
      } finally {
        refreshPortalInFlight = null
      }
    },
    ensureAIOrderProgressNarratives: async () => {
      const today = getLocalDateKey()
      const current = get().aiOrderProgressNarratives
      if (get().aiOrderProgressNarrativesLoading || current?.generatedFor === today) {
        return
      }

      set({ aiOrderProgressNarrativesLoading: true, aiOrderProgressNarrativesError: null })
      try {
        const result = await runTask(aiOrderProgressNarrativesIO({}))
        set({ aiOrderProgressNarratives: result, aiOrderProgressNarrativesLoading: false })
      } catch (error) {
        set({
          aiOrderProgressNarrativesError: error instanceof Error ? error.message : 'AI 订单进度叙事生成失败',
          aiOrderProgressNarrativesLoading: false,
        })
      }
    },
    bootstrap: async () => {
      set({ bootstrapDone: false, loadError: null })
      try {
        await get().refreshPortal()
        await get().ensureAIOrderProgressNarratives()
      } catch (error) {
        set({ loadError: error instanceof Error ? error.message : '加载失败' })
      } finally {
        set({ bootstrapDone: true })
      }
    },
  }
}
