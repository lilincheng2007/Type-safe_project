import { cartLineKey, maxCartLineQuantity, productAvailable } from '@/lib/cart-inventory'

import type { CustomerPortalStore } from '../types'
import type { CustomerPortalGet, CustomerPortalSet } from './types'

export function createCartActions(
  set: CustomerPortalSet,
  get: CustomerPortalGet,
): Pick<CustomerPortalStore, 'reorderOrder' | 'addProductToCart' | 'addBundleToCart' | 'changeQuantity' | 'changeCartLineQuantity'> {
  return {
    reorderOrder: (orderId) => {
      const { pendingOrders, historyOrders, products } = get()
      const order = [...pendingOrders, ...historyOrders].find((item) => item.id === orderId)

      if (!order) {
        return { ok: false, message: '未找到这笔订单，无法再来一单。' }
      }

      const reorderItems = order.items.filter((item) => {
        const product = products.find((current) => current.id === item.productId && current.merchantId === order.merchantId)
        return product ? productAvailable(product) && (product.bundleGroups ?? []).length === 0 : false
      })

      if (reorderItems.length === 0) {
        return { ok: false, message: '这笔订单中的菜品暂不可购买。' }
      }

      let addedCount = 0
      set((state) => {
        const nextCartLines = [...state.cartLines]
        reorderItems.forEach((item) => {
          const draftLine = { merchantId: order.merchantId, productId: item.productId, quantity: 0 }
          const key = cartLineKey(draftLine)
          const matchedIndex = nextCartLines.findIndex((line) => cartLineKey(line) === key)
          const currentQuantity = matchedIndex >= 0 ? nextCartLines[matchedIndex].quantity : 0
          const otherLines = matchedIndex >= 0 ? nextCartLines.filter((_, index) => index !== matchedIndex) : nextCartLines
          const maxQuantity = maxCartLineQuantity(draftLine, products, otherLines)
          const nextQuantity = Math.min(maxQuantity, currentQuantity + item.quantity)
          const added = Math.max(0, nextQuantity - currentQuantity)
          addedCount += added

          if (nextQuantity <= 0) return
          if (matchedIndex >= 0) {
            nextCartLines[matchedIndex] = { ...nextCartLines[matchedIndex], quantity: nextQuantity }
          } else {
            nextCartLines.push({ merchantId: order.merchantId, productId: item.productId, quantity: nextQuantity })
          }
        })

        return { cartLines: nextCartLines, activeTab: 'cart' }
      })

      return addedCount > 0 ? { ok: true, addedCount } : { ok: false, message: '这笔订单中的菜品已售罄或超过限购。' }
    },

    addProductToCart: (merchantId, productId) =>
      set((state) => {
        const product = state.products.find((item) => item.id === productId && item.merchantId === merchantId)
        if (!product || !productAvailable(product)) return {}
        const draftLine = { merchantId, productId, quantity: 1 }
        const key = cartLineKey(draftLine)
        const matched = state.cartLines.find((line) => cartLineKey(line) === key)
        const otherLines = state.cartLines.filter((line) => cartLineKey(line) !== key)
        const maxQuantity = maxCartLineQuantity(draftLine, state.products, otherLines)

        if (!matched) {
          return maxQuantity >= 1 ? { cartLines: [...state.cartLines, draftLine] } : {}
        }

        return {
          cartLines: state.cartLines.map((line) =>
            cartLineKey(line) === key ? { ...line, quantity: Math.min(maxQuantity, line.quantity + 1) } : line,
          ),
        }
      }),

    addBundleToCart: (merchantId, productId, bundleSelections) =>
      set((state) => {
        const draftLine = { merchantId, productId, quantity: 1, bundleSelections }
        const key = cartLineKey(draftLine)
        const matched = state.cartLines.find((line) => cartLineKey(line) === key)
        const otherLines = state.cartLines.filter((line) => cartLineKey(line) !== key)
        const maxQuantity = maxCartLineQuantity(draftLine, state.products, otherLines)

        if (!matched) {
          return maxQuantity >= 1 ? { cartLines: [...state.cartLines, draftLine] } : {}
        }

        return {
          cartLines: state.cartLines.map((line) =>
            cartLineKey(line) === key ? { ...line, quantity: Math.min(maxQuantity, line.quantity + 1) } : line,
          ),
        }
      }),

    changeQuantity: (merchantId, productId, nextQuantity) =>
      set((state) => {
        const key = cartLineKey({ merchantId, productId })
        if (nextQuantity <= 0) {
          return { cartLines: state.cartLines.filter((line) => cartLineKey(line) !== key) }
        }

        const targetLine = state.cartLines.find((line) => cartLineKey(line) === key) ?? { merchantId, productId, quantity: nextQuantity }
        const otherLines = state.cartLines.filter((line) => cartLineKey(line) !== key)
        const maxQuantity = maxCartLineQuantity(targetLine, state.products, otherLines)
        const quantity = Math.min(nextQuantity, maxQuantity)

        return {
          cartLines: quantity <= 0
            ? state.cartLines.filter((line) => cartLineKey(line) !== key)
            : state.cartLines.map((line) => cartLineKey(line) === key ? { ...line, quantity } : line),
        }
      }),

    changeCartLineQuantity: (lineKey, nextQuantity) =>
      set((state) => {
        if (nextQuantity <= 0) {
          return { cartLines: state.cartLines.filter((line) => cartLineKey(line) !== lineKey) }
        }

        const targetLine = state.cartLines.find((line) => cartLineKey(line) === lineKey)
        if (!targetLine) return {}
        const otherLines = state.cartLines.filter((line) => cartLineKey(line) !== lineKey)
        const maxQuantity = maxCartLineQuantity(targetLine, state.products, otherLines)
        const quantity = Math.min(nextQuantity, maxQuantity)

        return {
          cartLines: quantity <= 0
            ? state.cartLines.filter((line) => cartLineKey(line) !== lineKey)
            : state.cartLines.map((line) => cartLineKey(line) === lineKey ? { ...line, quantity } : line),
        }
      }),
  }
}
