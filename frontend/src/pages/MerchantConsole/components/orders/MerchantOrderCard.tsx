import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import type { Order } from '@/objects/order/Order'

import { orderItemSummary, statusHint } from '../../functions/merchantOrderDisplay'

export function MerchantOrderCard({ order, children, onOpen }: { order: Order; children?: ReactNode; onOpen: () => void }) {
  return (
    <div
      className="cursor-pointer rounded-xl border border-orange-100 bg-white/90 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/60 hover:shadow-md"
      onClick={onOpen}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="truncate font-medium text-slate-900">订单 {order.id}</p>
        <Badge variant="outline" className="shrink-0 border-orange-200 bg-orange-50 text-orange-700">
          {order.status}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-slate-600">{statusHint(order)}</p>
      {order.estimatedReadyAt ? <p className="mt-1 text-xs font-medium text-orange-600">预计出餐：{order.estimatedReadyAt}</p> : null}
      {order.prepDelayReason ? <p className="mt-1 text-xs font-medium text-amber-600">延迟原因：{order.prepDelayReason}</p> : null}
      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{orderItemSummary(order)}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-slate-500">下单时间 {order.placedAt}</span>
        <span className="font-semibold text-orange-600">应收 ¥{(order.merchantReceivableAmount ?? order.payableAmount).toFixed(2)}</span>
      </div>
      {children ? <div className="mt-3 flex flex-wrap gap-2">{children}</div> : null}
    </div>
  )
}
