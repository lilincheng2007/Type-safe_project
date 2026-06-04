import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { resolveApiMediaUrl } from '@/lib/api-media-url'
import type { Order } from '@/objects/order/Order'

type OrderNoteDialogProps = {
  order: Order | null
  onOpenChange: (open: boolean) => void
}

export function OrderNoteDialog({ order, onOpenChange }: OrderNoteDialogProps) {
  return (
    <Dialog open={order !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl bg-white p-5">
        <DialogHeader>
          <DialogTitle>客人备注</DialogTitle>
          <DialogDescription>{order ? `订单 ${order.id}` : '查看顾客下单备注'}</DialogDescription>
        </DialogHeader>
        {order ? (
          <div className="space-y-3">
            {order.customerNoteText ? (
              <p className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{order.customerNoteText}</p>
            ) : null}
            {order.customerNoteImageUrl ? (
              <img src={resolveApiMediaUrl(order.customerNoteImageUrl)} alt="客人备注图片" className="aspect-video w-full rounded-xl object-cover" />
            ) : null}
            {!order.customerNoteText && !order.customerNoteImageUrl ? <p className="text-sm text-slate-500">暂无备注。</p> : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
