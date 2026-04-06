import { ArrowRightLeft, Clock3, Radar, Route } from 'lucide-react'
import { useEffect, useState } from 'react'

import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMockSystem } from '@/hooks/useMockSystem'
import { fetchOrdersPanel, type OrdersPanelResponse } from '@/lib/api/deliveryApi'

const pageName = '订单中心'
const route = '/delivery/orders'

const statusFlow = ['待接单', '制作中', '配送中', '已完成'] as const

export default function OrderCenter() {
  const { openMockDialog } = useMockSystem()
  const [panel, setPanel] = useState<OrdersPanelResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchOrdersPanel()
        if (!cancelled) setPanel(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '加载失败')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const orders = panel?.orders ?? []
  const riders = panel?.riders ?? []

  return (
    <DeliveryPageShell
      title="平台后端 - 订单中心"
      description="处理订单状态流转、基础派单策略和状态通知，是外卖平台的核心链路。"
      roleBadge="订单中心"
    >
      {error ? (
        <Card className="border-rose-200 bg-rose-50/90">
          <CardContent className="p-4 text-sm text-rose-800">{error}</CardContent>
        </Card>
      ) : null}

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="size-5 text-orange-500" />
            订单状态流转
          </CardTitle>
          <CardDescription>标准状态：待接单 → 制作中 → 配送中 → 已完成</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          {statusFlow.map((status) => (
            <div key={status} className="rounded-xl border border-orange-100 p-3 text-center">
              <p className="font-medium text-slate-900">{status}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="size-5 text-orange-500" />
            基础派单系统
          </CardTitle>
          <CardDescription>策略：最近 3 公里内最闲的 3 位骑手抢单</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-700">
            当前可调度骑手：{riders.filter((item) => item.status !== '配送中').length} / {riders.length}
          </p>
          <Button
            onClick={() =>
              openMockDialog({
                pageName,
                route,
                componentName: '执行派单',
                interactionName: '自动派单',
                title: '选择自动派单结果',
                description: '模拟订单中心执行基础派单逻辑后的结果。',
                options: [
                  {
                    id: 'dispatch-success',
                    title: '派单成功',
                    description: '已通知附近 3 位骑手参与抢单。',
                    badge: 'success',
                    noticeMessage: '派单成功，等待骑手确认。',
                  },
                  {
                    id: 'dispatch-timeout',
                    title: '抢单超时',
                    description: '附近骑手未响应，进入二次派单。',
                    badge: 'warning',
                  },
                  {
                    id: 'dispatch-failed',
                    title: '派单失败',
                    description: '调度服务异常，需人工介入。',
                    badge: 'error',
                  },
                ],
                onSelect: () => undefined,
              })
            }
          >
            执行派单
          </Button>
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock3 className="size-5 text-orange-500" />
            订单队列
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-orange-100 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">订单 {order.id}</p>
                <Badge variant="outline">{order.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                金额 {order.totalAmount} 元 · 地址 {order.deliveryAddress}
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
                    interactionName: '手动推进状态',
                    title: `选择订单 ${order.id} 的状态推进结果`,
                    description: '模拟订单中心手动推进订单状态。',
                    options: [
                      {
                        id: 'status-next',
                        title: '推进到下一状态',
                        description: '订单按标准链路推进。',
                        badge: 'success',
                        noticeMessage: '订单状态已更新。',
                      },
                      {
                        id: 'status-cancel',
                        title: '取消订单',
                        description: '订单被客服或系统取消。',
                        badge: 'warning',
                      },
                    ],
                    onSelect: () => undefined,
                  })
                }
              >
                <Route className="size-4" />
                推进状态
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </DeliveryPageShell>
  )
}
