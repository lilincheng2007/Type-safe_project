import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { orderPriceBreakdown, priceBreakdownAmountClassName, priceBreakdownAmountText } from '@/lib/order-price-breakdown'
import { buildOrderTimeline, estimateDeliveryRange, formatTimelineTime, orderTimelineAlert } from '@/lib/order-timeline'
import { cn } from '@/lib/utils'
import type { Order } from '@/objects/order/Order'
import { OrderStatuses, RefundStatuses } from '@/objects/shared/ids'

type OrderDetailDialogProps = {
  selectedOrder: Order | null
  onOpenChange: (open: boolean) => void
  onClose: () => void
  onCancelOrder: (order: Order) => void
  onCompleteOrder: (order: Order) => void
  onReviewOrder: (order: Order) => void
  onRefundOrder: (order: Order) => void
  onAppealRefund: (order: Order) => void
}

function canCancel(order: Order): boolean {
  return order.status === OrderStatuses.waitingForMerchantAcceptance
}

function canComplete(order: Order): boolean {
  return order.status === OrderStatuses.delivered
}

function canRequestRefund(order: Order): boolean {
  if (order.status !== OrderStatuses.completed) return false
  if (!order.refundStatus) return true
  return ![
    RefundStatuses.pending,
    RefundStatuses.legacyPending,
    RefundStatuses.merchantRejected,
    RefundStatuses.adminPending,
    RefundStatuses.accepted,
    RefundStatuses.rejected,
  ].includes(order.refundStatus)
}

function orderStatusDescription(order: Order): string | null {
  if (order.status === OrderStatuses.waitingForMerchantAcceptance) {
    return '订单已提交，正在等待商家确认；此阶段可取消订单。'
  }
  if (order.status === OrderStatuses.cooking) {
    return '商家已接单，后厨正在制作餐品。'
  }
  if (order.status === OrderStatuses.waitingForRiderAcceptance) {
    return '商家已出餐，正在等待骑手接单取餐。'
  }
  if (order.status === OrderStatuses.delivering) {
    return '骑手已接单，餐品正在配送途中。'
  }
  if (order.status === OrderStatuses.delivered) {
    return '餐品已送达，可确认完成。'
  }
  if (order.status === OrderStatuses.canceled) {
    return '订单已取消，款项已按规则退回钱包。'
  }
  if (order.status === OrderStatuses.refunded) {
    return '退款已通过，实付金额已退回钱包。'
  }
  return null
}

function orderItemDisplayName(rawName: string) {
  const match = rawName.match(/^(.*?)[（(]((?:套餐内容|[^：:）)]+)[：:][\s\S]+)[）)]$/)
  if (!match) return { name: rawName, bundleSummary: '' }
  return {
    name: match[1].trim() || rawName,
    bundleSummary: match[2].trim(),
  }
}

export function OrderDetailDialog({
  selectedOrder,
  onOpenChange,
  onClose,
  onCancelOrder,
  onCompleteOrder,
  onReviewOrder,
  onRefundOrder,
  onAppealRefund,
}: OrderDetailDialogProps) {
  const breakdown = selectedOrder ? orderPriceBreakdown(selectedOrder) : null
  const timeline = selectedOrder ? buildOrderTimeline(selectedOrder) : []
  const deliveryRange = selectedOrder ? estimateDeliveryRange(selectedOrder) : null
  const alertText = selectedOrder ? orderTimelineAlert(selectedOrder) : null

  return (
    <Dialog open={selectedOrder !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,46rem)] max-w-md flex-col gap-0 overflow-hidden rounded-2xl border border-orange-100 bg-white p-0">
        <DialogHeader className="shrink-0 px-6 pt-6 pr-12 pb-4">
          <DialogTitle>订单详情</DialogTitle>
          <DialogDescription>{selectedOrder ? `订单号：${selectedOrder.id}` : '查看订单商品与金额信息'}</DialogDescription>
        </DialogHeader>
        {selectedOrder ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-3">
            <div className="space-y-2 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-rose-50 px-4 py-3 text-sm text-slate-700">
              {breakdown?.lines.map((line) => {
                const isTotal = line.kind === 'total'
                return (
                  <div key={line.key} className={`flex items-center justify-between ${isTotal ? 'font-semibold text-orange-700' : priceBreakdownAmountClassName(line)}`}>
                    <span>{line.label}</span>
                    <span className={isTotal ? 'text-lg tabular-nums' : 'tabular-nums'}>{priceBreakdownAmountText(line)}</span>
                  </div>
                )
              })}
              {selectedOrder.usedVoucher ? (
                <p className="rounded-lg bg-white/70 px-2 py-1 text-xs text-orange-700">
                  已使用：{selectedOrder.usedVoucher.title}
                </p>
              ) : null}
              <Separator className="bg-orange-100" />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{selectedOrder.pointsAwarded > 0 ? '已获得积分' : '预计获得积分'}</span>
                <span>+{selectedOrder.pointsAwarded > 0 ? selectedOrder.pointsAwarded : Math.floor(selectedOrder.payableAmount)}</span>
              </div>
            </div>
            {selectedOrder.refundStatus ? (
              <div className="rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm text-slate-700">
                <p>
                  退款状态：<span className="font-semibold text-orange-600">{selectedOrder.refundStatus}</span>
                </p>
                {selectedOrder.refundReason ? <p className="mt-1 text-xs text-slate-500">申请理由：{selectedOrder.refundReason}</p> : null}
                {selectedOrder.refundMerchantReason ? <p className="mt-1 text-xs text-slate-500">商家反馈：{selectedOrder.refundMerchantReason}</p> : null}
                {selectedOrder.refundAdminReason ? <p className="mt-1 text-xs text-slate-500">管理员仲裁：{selectedOrder.refundAdminReason}</p> : null}
              </div>
            ) : null}
            <div className="rounded-xl bg-orange-50 px-3 py-2 text-sm text-slate-700">
              当前状态：
              <span className="ml-1 font-semibold text-orange-600">{selectedOrder.status}</span>
              {orderStatusDescription(selectedOrder) ? (
                <p className="mt-1 text-xs text-slate-500">{orderStatusDescription(selectedOrder)}</p>
              ) : null}
              {selectedOrder.estimatedReadyAt ? <p className="mt-1 text-xs text-orange-700">预计出餐：{selectedOrder.estimatedReadyAt}</p> : null}
              {deliveryRange ? <p className="mt-1 text-xs text-orange-700">预计送达：{deliveryRange}</p> : null}
              {alertText ? <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">{alertText}</p> : null}
            </div>
            <div className="rounded-2xl border border-orange-100 bg-white px-3 py-3">
              <p className="mb-3 text-sm font-semibold text-slate-900">订单时间线</p>
              <div className="space-y-3">
                {timeline.map((node) => (
                  <div key={node.key} className="flex gap-3">
                    <span
                      className={cn(
                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold',
                        node.state === 'done' && 'border-orange-500 bg-orange-500 text-white',
                        node.state === 'current' && 'border-orange-500 bg-orange-50 text-orange-600',
                        node.state === 'pending' && 'border-slate-200 bg-slate-50 text-slate-300',
                      )}
                    >
                      {node.state === 'pending' ? '' : '✓'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className={cn('text-sm font-medium', node.state === 'pending' ? 'text-slate-400' : 'text-slate-900')}>{node.label}</p>
                        <span className="text-xs text-slate-500">{formatTimelineTime(node.time)}</span>
                      </div>
                      {node.description ? <p className="mt-0.5 text-xs text-slate-500">{node.description}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">商品明细</p>
              {selectedOrder.items.map((item) => {
                const display = orderItemDisplayName(item.name)
                return (
                  <div
                    key={`${selectedOrder.id}-${item.productId}`}
                    className="flex items-start justify-between gap-3 rounded-lg border border-orange-100 px-3 py-2"
                  >
                    <div className="min-w-0 text-sm text-slate-700">
                      <p>{display.name}</p>
                      {display.bundleSummary ? (
                        <p className="mt-1 break-words rounded-md bg-orange-50 px-2 py-1 text-xs leading-5 text-orange-700">
                          {display.bundleSummary}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-slate-500">x{item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-sm font-medium text-slate-900">¥{(item.unitPrice * item.quantity).toFixed(2)}</p>
                  </div>
                )
              })}
            </div>
          </div>
          </div>
        ) : null}
        <DialogFooter className="shrink-0 border-t border-orange-100 px-6 py-4">
          {selectedOrder && canComplete(selectedOrder) ? (
            <Button onClick={() => onCompleteOrder(selectedOrder)}>
              完成订单
            </Button>
          ) : null}
          {selectedOrder && selectedOrder.status === OrderStatuses.completed ? (
            <Button onClick={() => onReviewOrder(selectedOrder)}>
              评价订单
            </Button>
          ) : null}
          {selectedOrder && canRequestRefund(selectedOrder) ? (
            <Button variant="outline" onClick={() => onRefundOrder(selectedOrder)}>
              申请退款
            </Button>
          ) : null}
          {selectedOrder && selectedOrder.refundStatus === RefundStatuses.merchantRejected ? (
            <Button variant="outline" onClick={() => onAppealRefund(selectedOrder)}>
              提交管理员仲裁
            </Button>
          ) : null}
          {selectedOrder && canCancel(selectedOrder) ? (
            <Button variant="destructive" onClick={() => onCancelOrder(selectedOrder)}>
              取消订单
            </Button>
          ) : null}
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
