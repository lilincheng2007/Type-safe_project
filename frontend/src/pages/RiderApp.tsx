import { Bike, MapPinned, Navigation, Route, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { RiderAccountPublic } from '@/delivery/model/accounts'
import { fetchRiderMeIO } from '@/rider/api/RiderMeApi'
import { runTask } from '@/shared/http/client'
import { useAppChrome } from '@/hooks/useAppChrome'

export default function RiderApp() {
  const { showNotice } = useAppChrome()
  const [bootstrapDone, setBootstrapDone] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [riderAccount, setRiderAccount] = useState<RiderAccountPublic | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const me = await runTask(fetchRiderMeIO())
        if (cancelled) return
        setRiderAccount(me.riderAccount)
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : '加载失败')
      } finally {
        if (!cancelled) setBootstrapDone(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const rider = riderAccount?.profile.rider ?? null
  const assignedOrders = riderAccount ? riderAccount.profile.pendingOrders : []

  if (!bootstrapDone) {
    return (
      <DeliveryPageShell title="骑手端核心功能" description="正在加载…" roleBadge="骑手 APP">
        <Card className="border-orange-100 bg-white/95">
          <CardContent className="p-6 text-sm text-slate-600">加载中…</CardContent>
        </Card>
      </DeliveryPageShell>
    )
  }

  if (loadError) {
    return (
      <DeliveryPageShell title="骑手端核心功能" description="加载失败" roleBadge="骑手 APP">
        <Card className="border-orange-100 bg-white/95">
          <CardContent className="p-6 text-sm text-rose-600">{loadError}</CardContent>
        </Card>
      </DeliveryPageShell>
    )
  }

  if (!riderAccount || !rider) {
    return (
      <DeliveryPageShell
        title="骑手端核心功能"
        description="当前账号未绑定骑手信息，请先完成骑手注册资料。"
        roleBadge="骑手 APP"
      >
        <Card className="border-orange-100 bg-white/95">
          <CardContent className="p-6 text-sm text-slate-600">未找到当前骑手账号档案。</CardContent>
        </Card>
      </DeliveryPageShell>
    )
  }

  return (
    <DeliveryPageShell
      title="骑手端核心功能"
      description="支持骑手注册登录、抢单/派单、查看订单详情与导航、更新配送状态。"
      roleBadge="骑手 APP"
    >
      <section className="grid gap-4 md:grid-cols-4">
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>骑手姓名</CardDescription>
            <CardTitle>{rider.name}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>当前状态</CardDescription>
            <CardTitle>{rider.status}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>累计接单</CardDescription>
            <CardTitle>{rider.totalOrders}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>评分</CardDescription>
            <CardTitle>{rider.rating.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bike className="size-5 text-orange-500" />
            抢单 / 系统派单
          </CardTitle>
          <CardDescription>基础派单：优先分配给 3 公里内最闲的骑手进行抢单</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl border border-orange-100 p-4 text-sm text-slate-700">
            当前定位：{rider.realtimeLocation} · 所属站点：{rider.station}
          </div>
          <Button onClick={() => showNotice('抢单由后端 API 提供后再接线。', 'info')}>
            参与抢单
          </Button>
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinned className="size-5 text-orange-500" />
            配送任务
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assignedOrders.map((order) => (
            <div key={order.id} className="space-y-2 rounded-xl border border-orange-100 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">订单 {order.id}</p>
                <Badge variant="outline">{order.status}</Badge>
              </div>
              <p className="text-sm text-slate-600">配送地址：{order.deliveryAddress}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => showNotice('地图导航为端能力；与订单联动由后端 API 提供后再接线。', 'info')}
                >
                  <Navigation className="size-4" />
                  去导航
                </Button>
                <Button
                  size="sm"
                  onClick={() => showNotice('配送状态更新由后端 API 提供后再接线。', 'info')}
                >
                  <Route className="size-4" />
                  更新状态
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-orange-500" />
            薪资与合规
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          当前账户余额：{riderAccount.profile.walletBalance} 元；当月薪资（模拟）：{rider.salary} 元。客服可在严重投诉场景下触发扣款流程。
        </CardContent>
      </Card>
    </DeliveryPageShell>
  )
}
