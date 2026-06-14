import { AlertTriangle, Clock3, DollarSign, ReceiptText } from 'lucide-react'

import type { AdminOrderMonitorResponse } from '@/objects/admin/apiTypes/AdminOrderMonitorResponse'

type AdminMetricCardsProps = {
  orderMonitor: AdminOrderMonitorResponse
}

export function AdminMetricCards({ orderMonitor }: AdminMetricCardsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-orange-700"><ReceiptText className="size-4" />今日订单数</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-orange-900">{orderMonitor.todayOrderCount}</p>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-700"><DollarSign className="size-4" />今日成交额</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-emerald-900">¥{orderMonitor.todayTurnover.toFixed(2)}</p>
      </div>
      <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-amber-700"><Clock3 className="size-4" />待处理退款</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-amber-900">{orderMonitor.pendingRefunds.length}</p>
      </div>
      <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-rose-700"><AlertTriangle className="size-4" />异常订单</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-rose-900">{orderMonitor.abnormalOrders.length}</p>
      </div>
      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-sky-700"><Clock3 className="size-4" />商家超时</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-sky-900">{orderMonitor.merchantTimeoutOrders.length}</p>
      </div>
      <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-violet-700"><Clock3 className="size-4" />骑手超时</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-violet-900">{orderMonitor.riderTimeoutOrders.length}</p>
      </div>
    </div>
  )
}
