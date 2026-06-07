import { Trash2 } from 'lucide-react'

import { PromotionDateInput, PromotionEnableControl } from '@/components/PromotionControls'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { promotionSummary } from '@/lib/promotions'
import { cn } from '@/lib/utils'
import type { Promotion } from '@/objects/shared/Promotion'

export function promotionUsageText(promotion: Promotion) {
  if (promotion.remainingUses !== null && promotion.remainingUses !== undefined) return `${promotion.remainingUses}张优惠券`
  if (promotion.usageLimit !== null && promotion.usageLimit !== undefined) return `${promotion.usageLimit}张优惠券`
  return ''
}

export function normalizePromotionPatch(promotion: Promotion, patch: Partial<Promotion>): Promotion {
  const next = { ...promotion, ...patch }
  const usageLimit = next.usageLimit === null || next.usageLimit === undefined ? null : Math.max(1, Math.floor(next.usageLimit))
  return {
    ...next,
    discountValue: Math.max(0, Number(next.discountValue) || 0),
    triggerValue: next.triggerType === 'none' ? 0 : Math.max(1, Number(next.triggerValue) || 1),
    usageLimit,
    remainingUses: usageLimit === null ? null : Math.min(next.remainingUses ?? usageLimit, usageLimit),
    productIds: [],
  }
}

const padDatePart = (value: number) => value.toString().padStart(2, '0')
const toDateInputValue = (date: Date) => `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`
const parseDateInputValue = (value: string | null | undefined) => {
  const [year, month, day] = (value ?? '').split('-').map((part) => Number(part))
  if (!year || !month || !day) return null
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

export function todayPromotionDateValue(now = new Date()) {
  return toDateInputValue(now)
}

export function nextPromotionDateValue(value: string | null | undefined) {
  const date = parseDateInputValue(value)
  if (!date) return ''
  date.setDate(date.getDate() + 1)
  return toDateInputValue(date)
}

export function validatePromotionSchedule(promotion: Promotion, now = new Date()): string | null {
  const startsAt = promotion.startsAt?.trim() || null
  const endsAt = promotion.endsAt?.trim() || null
  const today = todayPromotionDateValue(now)

  if (!startsAt) return '请选择优惠开始日期。'
  if (!endsAt) return '请选择优惠截止日期。'
  if (startsAt < today) return '优惠开始日期不能早于今日。'
  if (endsAt <= startsAt) return '优惠截止日期必须晚于开始日期。'

  const dailyStartTime = promotion.dailyStartTime?.trim() || null
  const dailyEndTime = promotion.dailyEndTime?.trim() || null
  if (!dailyStartTime) return '请选择每日开始时间。'
  if (!dailyEndTime) return '请选择每日截止时间。'
  if (dailyStartTime === dailyEndTime) return '每日开始时间不能与截止时间相同。'

  return null
}

export function defaultPromotionSchedule() {
  const startsAtDate = new Date()
  const endsAtDate = new Date(startsAtDate)
  const targetMonth = startsAtDate.getMonth() + 1
  endsAtDate.setMonth(targetMonth)
  if (endsAtDate.getMonth() !== targetMonth % 12) {
    endsAtDate.setDate(0)
  }

  return {
    startsAt: toDateInputValue(startsAtDate),
    endsAt: toDateInputValue(endsAtDate),
    dailyStartTime: '00:00',
    dailyEndTime: '23:59',
  }
}

export function createDefaultPromotion(prefix: string, title: string): Promotion {
  const schedule = defaultPromotionSchedule()
  return {
    id: `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    discountType: 'amount',
    discountValue: 5,
    triggerType: 'none',
    triggerValue: 0,
    startsAt: schedule.startsAt,
    endsAt: schedule.endsAt,
    dailyStartTime: schedule.dailyStartTime,
    dailyEndTime: schedule.dailyEndTime,
    usageLimit: null,
    remainingUses: null,
    enabled: false,
  }
}

export function PromotionEditorCard({
  promotion,
  onChange,
  onRemove,
  disabledGray = false,
}: {
  promotion: Promotion
  onChange: (id: string, patch: Partial<Promotion>) => void
  onRemove: (id: string) => void
  disabledGray?: boolean
}) {
  const finite = promotion.usageLimit !== null && promotion.usageLimit !== undefined
  const usageText = promotionUsageText(promotion)
  const scheduleValidationMessage = validatePromotionSchedule(promotion)
  const startMinDate = todayPromotionDateValue()
  const endMinDate = nextPromotionDateValue(promotion.startsAt) || nextPromotionDateValue(startMinDate)

  return (
    <section
      className={cn(
        'space-y-3 rounded-xl border p-3 transition-colors',
        disabledGray && !promotion.enabled ? 'border-slate-200 bg-slate-100 text-slate-500 opacity-85' : 'border-orange-100 bg-orange-50/50',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={promotion.enabled ? 'default' : 'outline'}>{promotion.enabled ? '启用' : '停用'}</Badge>
            <h2 className="font-semibold text-slate-900">{promotion.title || '未命名优惠'}</h2>
          </div>
          <p className={cn('min-w-0 truncate text-xs', promotion.enabled ? 'text-orange-700' : 'text-slate-500')}>
            {promotion.enabled ? `预览：${promotionSummary(promotion)}${usageText ? ` · ${usageText}` : ''}` : '已停用：顾客端、结算和通知中不会显示该优惠'}
          </p>
        </div>
        <Button type="button" variant="outline" className="text-rose-600" onClick={() => onRemove(promotion.id)}>
          <Trash2 className="size-4" />
          删除
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_11rem_8rem]">
        <div className="space-y-1">
          <Label>优惠名称</Label>
          <Input value={promotion.title} onChange={(event) => onChange(promotion.id, { title: event.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>优惠类型</Label>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={promotion.discountType} onChange={(event) => onChange(promotion.id, { discountType: event.target.value as Promotion['discountType'] })}>
            <option value="amount">减xx元</option>
            <option value="percent">xx折</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>{promotion.discountType === 'percent' ? '折扣' : '金额'}</Label>
          <Input type="number" min="0" step="0.1" value={promotion.discountValue} onChange={(event) => onChange(promotion.id, { discountValue: Number(event.target.value) })} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[9rem_8rem_1fr_1fr] md:items-end">
        <div className="space-y-1">
          <Label>触发条件</Label>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={promotion.triggerType} onChange={(event) => onChange(promotion.id, { triggerType: event.target.value as Promotion['triggerType'], triggerValue: event.target.value === 'none' ? 0 : Math.max(1, promotion.triggerValue || 1) })}>
            <option value="none">无条件</option>
            <option value="amount">满xx元</option>
            <option value="items">满xx件</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>门槛</Label>
          <Input type="number" min="0" step="1" value={promotion.triggerValue} disabled={promotion.triggerType === 'none'} onChange={(event) => onChange(promotion.id, { triggerValue: Number(event.target.value) })} />
        </div>
        <div className="space-y-1">
          <Label>开始日期</Label>
          <PromotionDateInput value={promotion.startsAt} min={startMinDate} onChange={(value) => onChange(promotion.id, { startsAt: value })} />
        </div>
        <div className="space-y-1">
          <Label>截止日期</Label>
          <PromotionDateInput value={promotion.endsAt} min={endMinDate} onChange={(value) => onChange(promotion.id, { endsAt: value })} />
        </div>
      </div>

      {scheduleValidationMessage ? <p className="text-xs text-rose-600">{scheduleValidationMessage}</p> : null}

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_9rem_8rem_13rem] md:items-end">
        <div className="space-y-1">
          <Label>每日开始时刻</Label>
          <Input type="time" value={promotion.dailyStartTime ?? ''} onChange={(event) => onChange(promotion.id, { dailyStartTime: event.target.value || null })} />
          <p className="text-xs text-slate-500">若截止时间早于开始时间，将按次日截止计算。</p>
        </div>
        <div className="space-y-1">
          <Label>每日截止时刻</Label>
          <Input type="time" value={promotion.dailyEndTime ?? ''} onChange={(event) => onChange(promotion.id, { dailyEndTime: event.target.value || null })} />
          <p className="text-xs text-slate-500">开始时间不能与截止时间相同。</p>
        </div>
        <div className="space-y-1">
          <Label>次数</Label>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={finite ? 'finite' : 'infinite'} onChange={(event) => onChange(promotion.id, { usageLimit: event.target.value === 'finite' ? (promotion.usageLimit ?? 10) : null, remainingUses: event.target.value === 'finite' ? (promotion.remainingUses ?? promotion.usageLimit ?? 10) : null })}>
            <option value="infinite">无限次</option>
            <option value="finite">有限次数</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>可用次数</Label>
          <Input type="number" min="1" step="1" value={promotion.usageLimit ?? ''} disabled={!finite} onChange={(event) => onChange(promotion.id, { usageLimit: Number(event.target.value) || 1, remainingUses: Number(event.target.value) || 1 })} />
        </div>
        <PromotionEnableControl enabled={promotion.enabled} onChange={(enabled) => onChange(promotion.id, { enabled })} />
      </div>
    </section>
  )
}
