import { LocateFixed, Search, ShoppingCart, Wallet } from 'lucide-react'

import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMockSystem } from '@/hooks/useMockSystem'
import { customers, orders, products } from '@/lib/delivery-data'

const pageName = '顾客端 APP'
const route = '/delivery/customer'

export default function CustomerPortal() {
  const customer = customers[0]
  const { openMockDialog } = useMockSystem()

  return (
    <DeliveryPageShell
      title="顾客端核心功能"
      description="覆盖注册登录、定位、浏览搜索、购物车、下单支付、订单状态和配送轨迹等功能。"
      roleBadge="顾客 APP"
    >
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>账户余额</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-4 text-orange-500" />
              {customer.walletBalance.toFixed(2)} 元
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>常用收货地址</CardDescription>
            <CardTitle className="flex items-center gap-2 text-base">
              <LocateFixed className="size-4 text-orange-500" />
              {customer.defaultAddress}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>剩余优惠券</CardDescription>
            <CardTitle>{customer.vouchers.reduce((acc, item) => acc + item.remainingCount, 0)} 张</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-5 text-orange-500" />
            商家 / 商品浏览与搜索
          </CardTitle>
          <CardDescription>展示平台推荐商品，支持加入购物车和下单</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="space-y-2 rounded-xl border border-orange-100 p-3">
              <p className="font-medium text-slate-900">{product.name}</p>
              <p className="text-sm text-slate-600">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-600">{product.price} 元</span>
                <Badge variant="outline">{product.inventoryStatus}</Badge>
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={() =>
                  openMockDialog({
                    pageName,
                    route,
                    componentName: `${product.name}-加入购物车`,
                    interactionName: '购物车管理',
                    title: `选择「${product.name}」加入购物车结果`,
                    description: '模拟顾客加入购物车时的库存和风控结果。',
                    options: [
                      {
                        id: 'add-cart-success',
                        title: '加入成功',
                        description: '商品已加入购物车。',
                        badge: 'success',
                        noticeMessage: '已加入购物车。',
                      },
                      {
                        id: 'add-cart-stockout',
                        title: '库存不足',
                        description: '当前库存紧张，请减少数量。',
                        badge: 'warning',
                      },
                      {
                        id: 'add-cart-failed',
                        title: '加入失败',
                        description: '购物车服务异常，请稍后再试。',
                        badge: 'error',
                      },
                    ],
                    onSelect: () => undefined,
                  })
                }
              >
                <ShoppingCart className="size-4" />
                加入购物车
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle>订单状态与配送轨迹</CardTitle>
          <CardDescription>展示顾客历史订单和当前配送进度</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-orange-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">订单号：{order.id}</p>
                <Badge variant="outline">{order.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                金额：{order.totalAmount} 元 · 下单时间：{order.placedAt}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() =>
                  openMockDialog({
                    pageName,
                    route,
                    componentName: `订单-${order.id}`,
                    interactionName: '查看配送轨迹',
                    title: `选择订单 ${order.id} 的轨迹展示结果`,
                    description: '模拟顾客查看订单配送轨迹时可能出现的结果。',
                    options: [
                      {
                        id: 'track-success',
                        title: '轨迹加载成功',
                        description: '展示骑手实时位置和预计到达时间。',
                        badge: 'success',
                        noticeMessage: '地图轨迹已更新。',
                      },
                      {
                        id: 'track-delay',
                        title: '定位延迟',
                        description: '地图定位延迟，暂时展示最近一次位置。',
                        badge: 'warning',
                      },
                    ],
                    onSelect: () => undefined,
                  })
                }
              >
                查看配送轨迹
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </DeliveryPageShell>
  )
}
