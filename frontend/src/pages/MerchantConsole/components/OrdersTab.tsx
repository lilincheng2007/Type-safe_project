import { useState } from 'react'
import { Bike, CheckCircle2, ChefHat, ChevronDown, ChevronUp, Clock3, Workflow, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderChatUnreadBadge } from '@/components/OrderChatUnreadBadge'
import { OrderNoteDialog } from '@/components/OrderNoteDialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Order } from '@/objects/order/Order'
import { OrderStatuses } from '@/objects/shared/ids'
import { useOrderChatUnreadCounts } from '@/hooks/useOrderChatUnreadCounts'

import { CollapsedListLimit, prepTimeOptions, statusHint } from '../functions/merchantOrderDisplay'
import type { OrdersTabProps } from '../objects/merchantOrderView'
import { MerchantOrderCard } from './orders/MerchantOrderCard'

export function OrdersTab({ selectedStore, onAcceptOrder, onRejectOrder, onFinishCooking, onDelayPrep }: OrdersTabProps) {
  const navigate = useNavigate()
  const { unreadFor } = useOrderChatUnreadCounts()
  const merchantPendingOrders = selectedStore?.pendingOrders ?? []
  const merchantHistoryOrders = selectedStore?.historyOrders ?? []
  const awaitingMerchantOrders = merchantPendingOrders.filter(
    (order) => order.status === OrderStatuses.waitingForMerchantAcceptance,
  )
  const activeCookingOrders = merchantPendingOrders.filter((order) => order.status === OrderStatuses.cooking)
  const fulfillmentOrders = merchantPendingOrders.filter(
    (order) => order.status === OrderStatuses.waitingForRiderAcceptance || order.status === OrderStatuses.delivering,
  )
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showAllAwaitingMerchantOrders, setShowAllAwaitingMerchantOrders] = useState(false)
  const [showAllCookingOrders, setShowAllCookingOrders] = useState(false)
  const [showAllFulfillmentOrders, setShowAllFulfillmentOrders] = useState(false)
  const [showAllHistoryOrders, setShowAllHistoryOrders] = useState(false)
  const [noteTargetOrder, setNoteTargetOrder] = useState<Order | null>(null)
  const [prepMinutesByOrder, setPrepMinutesByOrder] = useState<Record<string, string>>({})
  const [delayReasonByOrder, setDelayReasonByOrder] = useState<Record<string, string>>({})
  const [delayMinutesByOrder, setDelayMinutesByOrder] = useState<Record<string, string>>({})
  const displayedAwaitingMerchantOrders = showAllAwaitingMerchantOrders ? awaitingMerchantOrders : awaitingMerchantOrders.slice(0, CollapsedListLimit)
  const displayedCookingOrders = showAllCookingOrders ? activeCookingOrders : activeCookingOrders.slice(0, CollapsedListLimit)
  const displayedFulfillmentOrders = showAllFulfillmentOrders ? fulfillmentOrders : fulfillmentOrders.slice(0, CollapsedListLimit)
  const displayedHistoryOrders = showAllHistoryOrders ? merchantHistoryOrders : merchantHistoryOrders.slice(0, CollapsedListLimit)

  if (!selectedStore) {
    return (
      <Card className="border-orange-100 bg-white/95">
        <CardContent className="p-6 text-sm text-slate-600">请先选择店铺后查看订单处理内容。</CardContent>
      </Card>
    )
  }

  const renderContactActions = (order: Order) => (
    <>
      <Button
        size="sm"
        variant="outline"
        className="relative"
        onClick={(event) => {
          event.stopPropagation()
          navigate(`/delivery/chat/${encodeURIComponent(order.id)}?peer=customer`)
        }}
      >
        联系顾客
        <OrderChatUnreadBadge count={unreadFor(order.id, 'customer')} />
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="relative"
        onClick={(event) => {
          event.stopPropagation()
          navigate(`/delivery/chat/${encodeURIComponent(order.id)}?peer=rider`)
        }}
      >
        联系骑手
        <OrderChatUnreadBadge count={unreadFor(order.id, 'rider')} />
      </Button>
      {order.customerNoteText || order.customerNoteImageUrl ? (
        <Button
          size="sm"
          variant="outline"
          onClick={(event) => {
            event.stopPropagation()
            setNoteTargetOrder(order)
          }}
        >
          查看客人备注
        </Button>
      ) : null}
    </>
  )

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-orange-100 bg-gradient-to-br from-white via-orange-50/70 to-rose-50/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="size-5 text-orange-500" />
            待商家接单
          </CardTitle>
          <CardDescription>顾客已完成付款，请及时确认接单；拒收会取消订单并退款。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {awaitingMerchantOrders.length === 0 ? (
            <p className="text-sm text-slate-500">当前暂无待确认订单。</p>
          ) : (
            displayedAwaitingMerchantOrders.map((order) => (
              <MerchantOrderCard key={order.id} order={order} onOpen={() => setSelectedOrder(order)}>
                {renderContactActions(order)}
                <div className="flex w-full flex-wrap items-end gap-2 rounded-lg border border-orange-100 bg-orange-50/60 p-2" onClick={(event) => event.stopPropagation()}>
                  <div className="min-w-40 flex-1 space-y-1">
                    <Label className="text-xs text-slate-600">预计备餐时间</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {prepTimeOptions.map((minutes) => (
                        <Button
                          key={`${order.id}-${minutes}`}
                          type="button"
                          size="sm"
                          variant={(prepMinutesByOrder[order.id] ?? '15') === String(minutes) ? 'default' : 'outline'}
                          onClick={() => setPrepMinutesByOrder((current) => ({ ...current, [order.id]: String(minutes) }))}
                        >
                          {minutes} 分钟
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="w-28 space-y-1">
                    <Label htmlFor={`prep-custom-${order.id}`} className="text-xs text-slate-600">自定义</Label>
                    <Input
                      id={`prep-custom-${order.id}`}
                      type="number"
                      min={1}
                      max={180}
                      value={prepMinutesByOrder[order.id] ?? '15'}
                      onChange={(event) => setPrepMinutesByOrder((current) => ({ ...current, [order.id]: event.target.value }))}
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm hover:from-orange-600 hover:to-rose-600"
                  onClick={(event) => {
                    event.stopPropagation()
                    const prepMinutes = Number.parseInt(prepMinutesByOrder[order.id] ?? '15', 10)
                    onAcceptOrder(order.id, Number.isFinite(prepMinutes) ? prepMinutes : 15)
                  }}
                >
                  <CheckCircle2 className="mr-1 size-4" />
                  接单
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={(event) => {
                    event.stopPropagation()
                    onRejectOrder(order.id)
                  }}
                >
                  <XCircle className="mr-1 size-4" />
                  拒收
                </Button>
              </MerchantOrderCard>
            ))
          )}
          {!showAllAwaitingMerchantOrders && awaitingMerchantOrders.length > CollapsedListLimit ? (
            <Button type="button" variant="ghost" className="mx-auto flex cursor-pointer text-slate-500" onClick={() => setShowAllAwaitingMerchantOrders(true)}>
              更多
              <ChevronDown className="size-4" />
            </Button>
          ) : null}
          {showAllAwaitingMerchantOrders && awaitingMerchantOrders.length > CollapsedListLimit ? (
            <Button type="button" variant="ghost" className="mx-auto flex cursor-pointer text-slate-500" onClick={() => setShowAllAwaitingMerchantOrders(false)}>
              收起
              <ChevronUp className="size-4" />
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="size-5 text-orange-500" />
            制作中
          </CardTitle>
          <CardDescription>商家接单后进入制作中；出餐完成后会变为待骑手接单。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeCookingOrders.length === 0 ? (
            <p className="text-sm text-slate-500">当前暂无待出餐订单。</p>
          ) : (
            displayedCookingOrders.map((order) => (
              <MerchantOrderCard key={order.id} order={order} onOpen={() => setSelectedOrder(order)}>
                {renderContactActions(order)}
                <div className="flex w-full flex-wrap items-end gap-2 rounded-lg border border-amber-100 bg-amber-50/60 p-2" onClick={(event) => event.stopPropagation()}>
                  <div className="w-28 space-y-1">
                    <Label htmlFor={`delay-minutes-${order.id}`} className="text-xs text-slate-600">延迟分钟</Label>
                    <Input
                      id={`delay-minutes-${order.id}`}
                      type="number"
                      min={1}
                      max={180}
                      value={delayMinutesByOrder[order.id] ?? '10'}
                      onChange={(event) => setDelayMinutesByOrder((current) => ({ ...current, [order.id]: event.target.value }))}
                    />
                  </div>
                  <div className="min-w-48 flex-1 space-y-1">
                    <Label htmlFor={`delay-reason-${order.id}`} className="text-xs text-slate-600">延迟原因</Label>
                    <Input
                      id={`delay-reason-${order.id}`}
                      value={delayReasonByOrder[order.id] ?? ''}
                      placeholder="如：高峰期排队、现做耗时"
                      onChange={(event) => setDelayReasonByOrder((current) => ({ ...current, [order.id]: event.target.value }))}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const minutes = Number.parseInt(delayMinutesByOrder[order.id] ?? '10', 10)
                      onDelayPrep(order.id, Number.isFinite(minutes) ? minutes : 10, delayReasonByOrder[order.id] ?? '')
                    }}
                  >
                    通知延迟
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={order.status !== OrderStatuses.cooking}
                  onClick={(event) => {
                    event.stopPropagation()
                    onFinishCooking(order.id)
                  }}
                >
                  出餐完成
                </Button>
              </MerchantOrderCard>
            ))
          )}
          {!showAllCookingOrders && activeCookingOrders.length > CollapsedListLimit ? (
            <Button type="button" variant="ghost" className="mx-auto flex cursor-pointer text-slate-500" onClick={() => setShowAllCookingOrders(true)}>
              更多
              <ChevronDown className="size-4" />
            </Button>
          ) : null}
          {showAllCookingOrders && activeCookingOrders.length > CollapsedListLimit ? (
            <Button type="button" variant="ghost" className="mx-auto flex cursor-pointer text-slate-500" onClick={() => setShowAllCookingOrders(false)}>
              收起
              <ChevronUp className="size-4" />
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bike className="size-5 text-blue-500" />
            履约中
          </CardTitle>
          <CardDescription>已出餐等待骑手接单，或骑手正在配送中的订单。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {fulfillmentOrders.length === 0 ? (
            <p className="text-sm text-slate-500">当前暂无履约中订单。</p>
          ) : (
            displayedFulfillmentOrders.map((order) => (
              <MerchantOrderCard key={order.id} order={order} onOpen={() => setSelectedOrder(order)}>
                {renderContactActions(order)}
              </MerchantOrderCard>
            ))
          )}
          {!showAllFulfillmentOrders && fulfillmentOrders.length > CollapsedListLimit ? (
            <Button type="button" variant="ghost" className="mx-auto flex cursor-pointer text-slate-500" onClick={() => setShowAllFulfillmentOrders(true)}>
              更多
              <ChevronDown className="size-4" />
            </Button>
          ) : null}
          {showAllFulfillmentOrders && fulfillmentOrders.length > CollapsedListLimit ? (
            <Button type="button" variant="ghost" className="mx-auto flex cursor-pointer text-slate-500" onClick={() => setShowAllFulfillmentOrders(false)}>
              收起
              <ChevronUp className="size-4" />
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock3 className="size-5 text-slate-500" />
            历史订单
          </CardTitle>
          <CardDescription>已取消、已送达和已完成的订单会显示在这里。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {merchantHistoryOrders.length === 0 ? (
            <p className="text-sm text-slate-500">当前暂无历史订单。</p>
          ) : (
            displayedHistoryOrders.map((order) => (
              <MerchantOrderCard key={order.id} order={order} onOpen={() => setSelectedOrder(order)}>
                {renderContactActions(order)}
              </MerchantOrderCard>
            ))
          )}
          {!showAllHistoryOrders && merchantHistoryOrders.length > CollapsedListLimit ? (
            <Button type="button" variant="ghost" className="mx-auto flex cursor-pointer text-slate-500" onClick={() => setShowAllHistoryOrders(true)}>
              更多
              <ChevronDown className="size-4" />
            </Button>
          ) : null}
          {showAllHistoryOrders && merchantHistoryOrders.length > CollapsedListLimit ? (
            <Button type="button" variant="ghost" className="mx-auto flex cursor-pointer text-slate-500" onClick={() => setShowAllHistoryOrders(false)}>
              收起
              <ChevronUp className="size-4" />
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={selectedOrder !== null} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-md rounded-2xl border border-orange-100 bg-white p-6">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
            <DialogDescription>{selectedOrder ? `订单号：${selectedOrder.id}` : '查看订单商品信息'}</DialogDescription>
          </DialogHeader>
          {selectedOrder ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-orange-50 px-3 py-2 text-sm text-slate-700">
                当前状态：<span className="font-semibold text-orange-600">{selectedOrder.status}</span>
                <p className="mt-1 text-xs text-slate-500">{statusHint(selectedOrder)}</p>
              </div>
              <div className="rounded-xl bg-orange-50 px-3 py-2 text-sm text-slate-700">
                商家应收：
                <span className="ml-1 font-semibold text-orange-600">¥{(selectedOrder.merchantReceivableAmount ?? selectedOrder.payableAmount).toFixed(2)}</span>
                <span className="ml-2 text-xs text-slate-500">顾客实付 ¥{selectedOrder.payableAmount.toFixed(2)}</span>
                {selectedOrder.discountAmount > 0 ? (
                  <span className="ml-2 text-xs text-green-600">已优惠 ¥{selectedOrder.discountAmount.toFixed(2)}</span>
                ) : null}
              </div>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={`${selectedOrder.id}-${item.productId}`} className="rounded-lg border border-orange-100 px-3 py-2">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-600">数量：{item.quantity}</p>
                    <p className="text-sm text-slate-600">金额：¥{(item.unitPrice * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <OrderNoteDialog order={noteTargetOrder} onOpenChange={(open) => !open && setNoteTargetOrder(null)} />
    </div>
  )
}
