import type { Merchant } from '@/objects/merchant/Merchant'
import type { MerchantBusinessStatus, MerchantWeeklyBusinessHour } from '@/objects/merchant/MerchantBusinessHours'

export const businessStatusLabels: Record<MerchantBusinessStatus, string> = {
  open: '营业中',
  resting: '休息中',
  closedToday: '今日打烊',
  paused: '临时暂停接单',
}

export function merchantAvailability(merchant: Merchant, now = new Date()) {
  const status = normalizeStatus(merchant.businessStatus)
  const today = toDateKey(now)
  const holiday = merchant.holidayBusinessHours?.find((item) => item.date === today)
  if (holiday) {
    const holidayStatus = normalizeStatus(holiday.businessStatus)
    if (holidayStatus !== 'open') return closed(holidayStatus, merchant, now)
    if (holiday.startTime && holiday.endTime) {
      const isOpen = inWindow(toTimeValue(now), holiday.startTime, holiday.endTime)
      return { isOpen, status: isOpen ? 'open' as const : 'resting' as const, label: isOpen ? '营业中，可下单' : '休息中，不可下单', nextOpenText: isOpen ? null : holiday.startTime }
    }
  }

  if (status !== 'open') return closed(status, merchant, now)
  const weekly = merchant.weeklyBusinessHours ?? []
  if (weekly.length === 0) return { isOpen: true, status: 'open' as const, label: '营业中，可下单', nextOpenText: null }
  const day = jsDayToIsoDay(now.getDay())
  const current = toTimeValue(now)
  const todayHours = weekly.filter((item) => item.enabled && item.dayOfWeek === day)
  if (todayHours.some((item) => inWindow(current, item.startTime, item.endTime))) {
    return { isOpen: true, status: 'open' as const, label: '营业中，可下单', nextOpenText: null }
  }
  return closed('resting', merchant, now)
}

function closed(status: MerchantBusinessStatus, merchant: Merchant, now: Date) {
  const nextOpenText = nextOpen(merchant.weeklyBusinessHours ?? [], now)
  return {
    isOpen: false,
    status,
    label: `${businessStatusLabels[status]}，不可下单`,
    nextOpenText,
  }
}

function nextOpen(hours: MerchantWeeklyBusinessHour[], now: Date) {
  if (hours.length === 0) return null
  const current = toTimeValue(now)
  const today = new Date(now)
  for (let offset = 0; offset <= 7; offset += 1) {
    const date = new Date(today)
    date.setDate(today.getDate() + offset)
    const day = jsDayToIsoDay(date.getDay())
    const matched = hours
      .filter((item) => item.enabled && item.dayOfWeek === day)
      .map((item) => item.startTime)
      .filter((time) => offset > 0 || time > current)
      .sort()[0]
    if (matched) return offset === 0 ? matched : `${toDateKey(date)} ${matched}`
  }
  return null
}

function normalizeStatus(value: string | null | undefined): MerchantBusinessStatus {
  return value === 'resting' || value === 'closedToday' || value === 'paused' || value === 'open' ? value : 'open'
}

function toDateKey(value: Date) {
  return `${value.getFullYear()}-${`${value.getMonth() + 1}`.padStart(2, '0')}-${`${value.getDate()}`.padStart(2, '0')}`
}

function toTimeValue(value: Date) {
  return `${`${value.getHours()}`.padStart(2, '0')}:${`${value.getMinutes()}`.padStart(2, '0')}`
}

function jsDayToIsoDay(day: number) {
  return day === 0 ? 7 : day
}

function inWindow(current: string, start: string, end: string) {
  if (start === end) return false
  return start < end ? current >= start && current < end : current >= start || current < end
}
