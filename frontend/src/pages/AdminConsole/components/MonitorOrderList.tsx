import { Badge } from '@/components/ui/badge'
import type { AdminOrderMonitorItem } from '@/objects/admin/apiTypes/AdminOrderMonitorResponse'

import { CollapsedListLimit, formatElapsed } from '../functions/adminFormatters'

export function MonitorOrderList({ title, items, emptyText }: { title: string; items: AdminOrderMonitorItem[]; emptyText: string }) {
  const displayedItems = items.slice(0, CollapsedListLimit)
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-semibold text-slate-950">{title}</p>
        <Badge variant={items.length > 0 ? 'outline' : 'secondary'}>{items.length}</Badge>
      </div>
      {items.length === 0 ? <p className="text-sm text-slate-500">{emptyText}</p> : null}
      <div className="space-y-2">
        {displayedItems.map((item) => (
          <div key={`${title}-${item.order.id}`} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-slate-900">订单 {item.order.id}</span>
              <Badge variant="outline">{item.order.status}</Badge>
            </div>
            <p className="mt-1 text-slate-600">{item.reason} · 已持续 {formatElapsed(item.elapsedMinutes)}</p>
            <p className="mt-1 text-slate-500">顾客：{item.order.customerName} · 金额 ¥{item.order.payableAmount.toFixed(2)}</p>
          </div>
        ))}
      </div>
      {items.length > CollapsedListLimit ? <p className="mt-2 text-xs text-slate-400">仅展示前 {CollapsedListLimit} 条，更多可后续进入订单明细处理。</p> : null}
    </div>
  )
}
