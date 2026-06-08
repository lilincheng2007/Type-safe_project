import type { Voucher } from '@/objects/shared/Voucher'

export const getTodayStart = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

export const isDateOnlyExpired = (expiresAt: string, todayStart: number) => {
  const time = Date.parse(`${expiresAt}T00:00:00`)
  return Number.isNaN(time) || time < todayStart
}

export const isVoucherExpired = (voucher: Voucher, todayStart: number) => isDateOnlyExpired(voucher.expiresAt, todayStart)

export const voucherUnavailableReason = (voucher: Voucher, todayStart: number, afterMerchantDiscount: number) => {
  if (voucher.remainingCount <= 0) return '已使用完'
  if (isDateOnlyExpired(voucher.expiresAt, todayStart)) return '已过期'
  if (afterMerchantDiscount < voucher.minSpend) return `还差 ¥${(voucher.minSpend - afterMerchantDiscount).toFixed(2)} 可用`
  return null
}
