import { create } from 'zustand'

import type { MerchantId, ProductId } from '@/objects/shared/ids'

import { createCartActions } from './customerPortal/actions/cartActions'
import { createCheckoutActions } from './customerPortal/actions/checkoutActions'
import { createOrderReviewActions } from './customerPortal/actions/orderReviewActions'
import { createPortalDataActions } from './customerPortal/actions/portalDataActions'
import { createProfileAiActions } from './customerPortal/actions/profileAiActions'
import { writeStoredFavorites } from './customerPortal/favoritesStorage'
import { initialState } from './customerPortal/initialState'
import { toggleCustomerFavorite } from './customerPortal/helpers'
import type { CartLine, CustomerFavorites, CustomerPortalStore, CustomerTab, FavoriteKind } from './customerPortal/types'

export type { CartLine, CustomerFavorites, CustomerTab, FavoriteKind }

export const useCustomerPortalStore = create<CustomerPortalStore>()((set, get) => ({
  ...initialState,
  resetPage: () => set(initialState),

  ...createPortalDataActions(set, get),

  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedMerchantId: (selectedMerchantId) => set({ selectedMerchantId }),
  toggleFavorite: (kind, id) =>
    set((state) => {
      const nextFavorites = toggleCustomerFavorite(state.favorites, kind, id as MerchantId | ProductId)
      writeStoredFavorites(nextFavorites)
      return { favorites: nextFavorites }
    }),

  ...createCartActions(set, get),

  setIsRechargeOpen: (isRechargeOpen) => set({ isRechargeOpen }),
  setRechargeAmountInput: (rechargeAmountInput) => set({ rechargeAmountInput }),
  setSelectedOrder: (selectedOrder) => set({ selectedOrder }),
  setReviewTargetOrder: (reviewTargetOrder) => set({ reviewTargetOrder }),

  ...createOrderReviewActions(set, get),
  ...createCheckoutActions(set, get),
  ...createProfileAiActions(set, get),
}))
