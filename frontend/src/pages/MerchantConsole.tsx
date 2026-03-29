import { ChartNoAxesCombined, PackageSearch, Store, Workflow } from 'lucide-react'

import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMockSystem } from '@/hooks/useMockSystem'
import { merchants, orders, products } from '@/lib/delivery-data'

const pageName = '商家端后台'
const route = '/delivery/merchant'

export default function MerchantConsole() {
  const { openMockDialog } = useMockSystem()
  const merchant = merchants[0]
  const merchantProducts = products.filter((item) => item.merchantId === merchant.id)
  const merchantOrders = orders.filter((item) => item.merchantId === merchant.id)

  return (
    <DeliveryPageShell
      title="商家端后台核心功能"
      description="包含商家入驻申请、商品管理、订单处理（接单/出餐完成）和营业概况查看。"
      roleBadge="商家后台"
    >
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>店铺名称</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Store className="size-4 text-orange-500" />
              {merchant.storeName}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>店铺评分</CardDescription>
            <CardTitle>{merchant.rating.toFixed(1)} / 5.0</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>主营商品数</CardDescription>
            <CardTitle>{merchantProducts.length}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageSearch className="size-5 text-orange-500" />
            商品管理（上架 / 下架 / 编辑）
          </CardTitle>
          <CardDescription>商家可实时更新商品信息与库存状态</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {merchantProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-100 p-4"
            >
              <div className="space-y-1">
                <p className="font-medium text-slate-900">{product.name}</p>
                <p className="text-sm text-slate-600">
                  月销量 {product.monthlySales} · 库存状态 {product.inventoryStatus}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    openMockDialog({
                      pageName,
                      route,
                      componentName: `${product.name}-编辑`,
                      interactionName: '编辑商品',
                      title: `选择「${product.name}」编辑结果`,
                      description: '模拟商家编辑商品价格或描述后的结果。',
                      options: [
                        {
                          id: 'edit-success',
                          title: '编辑成功',
                          description: '商品信息已更新并同步到顾客端。',
                          badge: 'success',
                          noticeMessage: '商品已更新。',
                        },
                        {
                          id: 'edit-invalid',
                          title: '参数校验失败',
                          description: '价格或描述不符合平台规范。',
                          badge: 'warning',
                        },
                      ],
                      onSelect: () => undefined,
                    })
                  }
                >
                  编辑
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    openMockDialog({
                      pageName,
                      route,
                      componentName: `${product.name}-上下架`,
                      interactionName: '商品上下架',
                      title: `选择「${product.name}」上下架结果`,
                      description: '模拟商品上架/下架后的状态变化。',
                      options: [
                        {
                          id: 'on-shelf',
                          title: '上架成功',
                          description: '顾客端可立即检索到该商品。',
                          badge: 'success',
                          noticeMessage: '商品已上架。',
                        },
                        {
                          id: 'off-shelf',
                          title: '下架成功',
                          description: '商品已从顾客端隐藏。',
                          badge: 'info',
                        },
                      ],
                      onSelect: () => undefined,
                    })
                  }
                >
                  上/下架
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="size-5 text-orange-500" />
            接单与出餐处理
          </CardTitle>
          <CardDescription>处理待接单订单并推进履约流程</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {merchantOrders.map((order) => (
            <div key={order.id} className="rounded-xl border border-orange-100 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">订单 {order.id}</p>
                <Badge variant="outline">{order.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-600">总金额 {order.totalAmount} 元</p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    openMockDialog({
                      pageName,
                      route,
                      componentName: `订单-${order.id}-接单`,
                      interactionName: '商家接单',
                      title: `选择订单 ${order.id} 接单结果`,
                      description: '模拟商家接单时的库存与容量校验。',
                      options: [
                        {
                          id: 'accept-order',
                          title: '接单成功',
                          description: '订单进入制作中状态。',
                          badge: 'success',
                          noticeMessage: '订单已接单。',
                        },
                        {
                          id: 'reject-order',
                          title: '拒单',
                          description: '商家繁忙，订单取消并退款。',
                          badge: 'warning',
                        },
                      ],
                      onSelect: () => undefined,
                    })
                  }
                >
                  接单
                </Button>
                <Button size="sm" variant="outline">
                  出餐完成
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartNoAxesCombined className="size-5 text-orange-500" />
            营业概况
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3 text-sm text-slate-700">
          <span>今日成交额（模拟）：{merchantOrders.reduce((sum, item) => sum + item.totalAmount, 0)} 元</span>
          <span>订单完成率（模拟）：92%</span>
        </CardContent>
      </Card>
    </DeliveryPageShell>
  )
}
