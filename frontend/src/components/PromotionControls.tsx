import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type PromotionDateInputProps = {
  value: string | null | undefined
  min?: string
  onChange: (value: string | null) => void
}

const parseStoredDate = (value: string | null | undefined) => {
  const [year, month, day] = (value ?? '').split('-').map((part) => Number(part))
  if (!year || !month || !day) return null
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return { year, month, day }
}

const pad = (value: number) => value.toString().padStart(2, '0')
const toStoredDate = (year: number, month: number, day: number) => `${year}-${pad(month)}-${pad(day)}`
const normalizeStoredDate = (value: string | null | undefined) => {
  const parsed = parseStoredDate(value)
  return parsed ? toStoredDate(parsed.year, parsed.month, parsed.day) : ''
}

export function PromotionDateInput({ value, min, onChange }: PromotionDateInputProps) {
  const normalizedValue = normalizeStoredDate(value)
  const normalizedMin = normalizeStoredDate(min)

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <Input
          type="date"
          value={normalizedValue}
          min={normalizedMin || undefined}
          onChange={(event) => onChange(event.target.value ? normalizeStoredDate(event.target.value) : null)}
        />
        {normalizedValue ? (
          <Button type="button" variant="ghost" className="shrink-0 px-2 text-xs text-slate-500" onClick={() => onChange(null)}>
            清空
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-slate-500">可点击日历选择，也可直接输入数字日期。</p>
    </div>
  )
}

export function PromotionEnableControl({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-2 rounded-xl border px-4 py-3 shadow-sm sm:w-52',
        enabled ? 'border-orange-200 bg-orange-50 text-orange-800' : 'border-slate-200 bg-slate-100 text-slate-500',
      )}
    >
      <span className="text-sm font-semibold">优惠状态</span>
      <select
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-900"
        value={enabled ? 'enabled' : 'disabled'}
        onChange={(event) => onChange(event.target.value === 'enabled')}
      >
        <option value="enabled">启用</option>
        <option value="disabled">停用</option>
      </select>
    </div>
  )
}
