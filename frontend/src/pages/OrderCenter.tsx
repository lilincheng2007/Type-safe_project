import { ArrowRightLeft, Clock3, Radar, Route } from 'lucide-react'
import { useEffect, useState } from 'react'

import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppChrome } from '@/hooks/useAppChrome'
import type { OrdersPanelResponse } from '@/delivery/model/api'
import { fetchOrdersPanelIO } from '@/admin/api/OrdersPanelApi'
import { runTask } from '@/shared/http/client'

const statusFlow = ['待接单', '制作中', '配送中', '已完成'] as const

export default function OrderCenter() {
  const { showNotice } = useAppChrome()
  const [panel, setPanel] = useState<OrdersPanelResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await runTask(fetchOrdersPanelIO())
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
          <Button onClick={() => showNotice('自动派单由后端 API 提供后再接线。', 'info')}>
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
                onClick={() => showNotice('订单状态推进由后端 API 提供后再接线。', 'info')}
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
