import { Clock3, MapPinHouse, Phone, UserRound, Wallet } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Merchant } from '@/objects/merchant'
import type { Order } from '@/objects/order'

type ProfileTabProps = {
  name: string
  phone: string
  defaultAddress: string
  walletBalance: number
  merchants: Merchant[]
  pendingOrders: Order[]
  historyOrders: Order[]
  onOpenRecharge: () => void
  onOpenEditProfile: () => void
  onSelectOrder: (order: Order) => void
}

export function ProfileTab({
  name,
  phone,
  defaultAddress,
  walletBalance,
  merchants,
  pendingOrders,
  historyOrders,
  onOpenRecharge,
  onOpenEditProfile,
  onSelectOrder,
}: ProfileTabProps) {
  const getMerchantName = (merchantId: string) =>
    merchants.find((merchant) => merchant.id === merchantId)?.storeName ?? '未知商家'

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-4">
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <div className="space-y-2">
              <CardDescription>我的余额</CardDescription>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="size-4 text-orange-500" />
                {walletBalance.toFixed(2)} 元
              </CardTitle>
            </div>
            <Button onClick={onOpenRecharge}>充值</Button>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>姓名</CardDescription>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="size-4 text-orange-500" />
              {name || '请完善姓名'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>联系电话</CardDescription>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="size-4 text-orange-500" />
              {phone || '请完善联系电话'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>常用收货地址</CardDescription>
            <CardTitle className="flex items-start gap-2 text-base leading-6">
              <MapPinHouse className="mt-0.5 size-4 shrink-0 text-orange-500" />
              <span>{defaultAddress || '请完善默认收货地址'}</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onOpenEditProfile}>
          修改资料
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>历史订单</CardDescription>
            <CardTitle>{historyOrders.length} 单</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>待收货</CardDescription>
            <CardTitle>{pendingOrders.length} 单</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock3 className="size-5 text-orange-500" />
            待收货订单
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingOrders.length === 0 ? (
            <p className="text-sm text-slate-500">暂无待收货订单。</p>
          ) : (
            pendingOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-orange-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">订单号：{order.id}</p>
                  <Badge variant="outline">{order.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">商家：{getMerchantName(order.merchantId)}</p>
                <p className="mt-1 text-sm text-slate-600">收货地址：{order.deliveryAddress}</p>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => onSelectOrder(order)}>
                    订单详情
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-5 text-orange-500" />
            历史订单
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {historyOrders.length === 0 ? (
            <p className="text-sm text-slate-500">暂无历史订单。</p>
          ) : (
            historyOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-orange-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">订单号：{order.id}</p>
                  <Badge variant="outline">{order.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">商家：{getMerchantName(order.merchantId)}</p>
                <p className="mt-1 text-sm text-slate-600">
                  金额：{order.totalAmount} 元 · 下单时间：{order.placedAt}
                </p>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => onSelectOrder(order)}>
                    订单详情
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
