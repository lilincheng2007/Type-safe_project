import { checkoutIO, type CheckoutDeliverySnapshot } from '@/apis/order/CheckoutAPI'
import { runTask } from '@/apis/shared/client'
import type { OrderMerchantNote } from '@/objects/order/apiTypes/CheckoutRequest'
import type { MerchantId, VoucherId } from '@/objects/shared/ids'
import { bundleLineUnitPrice } from '@/lib/bundles'
import { bestPromotion, roundMoney } from '@/lib/promotions'

import type { CustomerPortalStore } from '../types'
import type { CustomerPortalGet, CustomerPortalSet } from './types'

export function createCheckoutActions(
  set: CustomerPortalSet,
  get: CustomerPortalGet,
): Pick<CustomerPortalStore, 'checkout'> {
  return {
    checkout: async (options?: {
      merchantId?: MerchantId
      delivery?: CheckoutDeliverySnapshot
      voucherId?: VoucherId
      merchantNotes?: OrderMerchantNote[]
    }) => {
      const merchantId = options?.merchantId
      const { cartLines, walletBalance, products, customerAccount, merchants, platformPromotions } = get()
      const lines = merchantId ? cartLines.filter((line) => line.merchantId === merchantId) : cartLines

      if (lines.length === 0) {
        return {
          ok: false,
          message: merchantId ? '本店购物车为空，无法结算。' : '购物车为空，无法结算。',
        }
      }

      const cartTotal = lines.reduce((sum, line) => {
        const product = products.find((item) => item.id === line.productId)
        return sum + (product ? bundleLineUnitPrice(product, line.bundleSelections, products) * line.quantity : 0)
      }, 0)
      const merchantDiscount = [...new Set(lines.map((line) => line.merchantId))].reduce((sum, lineMerchantId) => {
        const merchantLines = lines.filter((line) => line.merchantId === lineMerchantId)
        const merchantTotal = merchantLines.reduce((lineSum, line) => {
          const product = products.find((item) => item.id === line.productId)
          return lineSum + (product ? bundleLineUnitPrice(product, line.bundleSelections, products) * line.quantity : 0)
        }, 0)
        const merchantItemCount = merchantLines.reduce((lineSum, line) => lineSum + line.quantity, 0)
        const merchant = merchants.find((item) => item.id === lineMerchantId)
        const promotionLines = merchantLines.flatMap((line) => {
          const product = products.find((item) => item.id === line.productId)
          return product ? [{ productId: line.productId, unitPrice: bundleLineUnitPrice(product, line.bundleSelections, products), quantity: line.quantity }] : []
        })
        return sum + (bestPromotion(merchant?.promotions, merchantTotal, merchantItemCount, promotionLines)?.discountAmount ?? 0)
      }, 0)
      const afterMerchantDiscount = Math.max(0, roundMoney(cartTotal - merchantDiscount))

      const selectedVoucher = customerAccount?.profile.vouchers.find((voucher) => voucher.id === options?.voucherId)
      const estimatedVoucherDiscount = selectedVoucher && afterMerchantDiscount >= selectedVoucher.minSpend && selectedVoucher.remainingCount > 0
        ? Math.min(selectedVoucher.discountAmount, afterMerchantDiscount)
        : 0
      const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)
      const promotionLines = lines.flatMap((line) => {
        const product = products.find((item) => item.id === line.productId)
        return product ? [{ productId: line.productId, unitPrice: bundleLineUnitPrice(product, line.bundleSelections, products), quantity: line.quantity }] : []
      })
      const estimatedPlatformDiscount = bestPromotion(platformPromotions, Math.max(0, afterMerchantDiscount - estimatedVoucherDiscount), itemCount, promotionLines)?.discountAmount ?? 0
      const estimatedDiscount = roundMoney(merchantDiscount + estimatedVoucherDiscount + estimatedPlatformDiscount)

      if (walletBalance < cartTotal - estimatedDiscount) {
        return { ok: false, message: '余额不足，请先充值。' }
      }

      try {
        const data = await runTask(checkoutIO(lines, options?.delivery, options?.voucherId, options?.merchantNotes ?? []))
        const nextCartLines = merchantId
          ? cartLines.filter((line) => line.merchantId !== merchantId)
          : []
        set({
          cartLines: nextCartLines,
          activeTab: merchantId ? get().activeTab : 'profile',
        })
        await get().refreshPortal()
        return { ok: true, createdCount: data.orders.length }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '结算失败' }
      }
    },
  }
}
