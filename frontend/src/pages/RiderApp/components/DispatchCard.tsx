import { useState } from 'react'
import { Bike, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderChatUnreadBadge } from '@/components/OrderChatUnreadBadge'
import { OrderNoteDialog } from '@/components/OrderNoteDialog'
import type { OrderChatUnreadLookup } from '@/hooks/useOrderChatUnreadCounts'
import type { Order } from '@/objects/order/Order'

interface DispatchCardProps {
  availableOrders: Order[]
  unreadFor: OrderChatUnreadLookup
  onGrabOrder: (orderId: string) => void
}

const CollapsedListLimit = 3

export function DispatchCard({ availableOrders, unreadFor, onGrabOrder }: DispatchCardProps) {
  const navigate = useNavigate()
  const [showAllAvailableOrders, setShowAllAvailableOrders] = useState(false)
  const [noteTargetOrder, setNoteTargetOrder] = useState<Order | null>(null)
  const displayedAvailableOrders = showAllAvailableOrders ? availableOrders : availableOrders.slice(0, CollapsedListLimit)

  return (
    <Card className="border-orange-100 bg-white/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bike className="size-5 text-orange-500" />
          抢单
        </CardTitle>
        <CardDescription>这里仅展示状态为待骑手接单的订单，均已由商家确认并出餐。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {availableOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-orange-100 p-4 text-sm text-slate-500">当前暂无可抢订单。</div>
        ) : (
          displayedAvailableOrders.map((order) => (
            <div key={order.id} className="rounded-xl border border-orange-100 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">订单 {order.id}</p>
                <Badge variant="outline">{order.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-600">配送地址：{order.deliveryAddress}</p>
              <p className="mt-1 text-sm text-slate-600">取餐说明：商家已出餐，接单后请前往取餐。</p>
              <p className="mt-1 text-sm text-slate-600">实付金额：¥{order.payableAmount.toFixed(2)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="relative" onClick={() => navigate(`/delivery/chat/${encodeURIComponent(order.id)}?peer=customer`)}>
                  联系顾客
                  <OrderChatUnreadBadge count={unreadFor(order.id, 'customer')} />
                </Button>
                <Button size="sm" variant="outline" className="relative" onClick={() => navigate(`/delivery/chat/${encodeURIComponent(order.id)}?peer=merchant`)}>
                  联系商家
                  <OrderChatUnreadBadge count={unreadFor(order.id, 'merchant')} />
                </Button>
                {order.customerNoteText || order.customerNoteImageUrl ? (
                  <Button size="sm" variant="outline" onClick={() => setNoteTargetOrder(order)}>
                    查看客人备注
                  </Button>
                ) : null}
                <Button size="sm" onClick={() => onGrabOrder(order.id)}>
                  抢这一单
                </Button>
              </div>
            </div>
          ))
        )}
        {!showAllAvailableOrders && availableOrders.length > CollapsedListLimit ? (
          <Button type="button" variant="ghost" className="mx-auto flex cursor-pointer text-slate-500" onClick={() => setShowAllAvailableOrders(true)}>
            更多
            <ChevronDown className="size-4" />
          </Button>
        ) : null}
        {showAllAvailableOrders && availableOrders.length > CollapsedListLimit ? (
          <Button type="button" variant="ghost" className="mx-auto flex cursor-pointer text-slate-500" onClick={() => setShowAllAvailableOrders(false)}>
            收起
            <ChevronUp className="size-4" />
          </Button>
        ) : null}
      </CardContent>
      <OrderNoteDialog order={noteTargetOrder} onOpenChange={(open) => !open && setNoteTargetOrder(null)} />
    </Card>
  )
}
