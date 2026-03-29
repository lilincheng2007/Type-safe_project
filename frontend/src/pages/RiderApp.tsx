import { Bike, MapPinned, Navigation, Route, ShieldCheck } from 'lucide-react'

import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthSession } from '@/lib/auth-session'
import { getRiderAccountByUsername } from '@/lib/account-store'
import { useMockSystem } from '@/hooks/useMockSystem'

const pageName = '骑手端 APP'
const route = '/delivery/rider'

export default function RiderApp() {
  const { openMockDialog } = useMockSystem()
  const session = getAuthSession()
  const riderAccount = session ? getRiderAccountByUsername(session.account) : null
  const rider = riderAccount?.profile.rider ?? null
  const assignedOrders = riderAccount ? riderAccount.profile.pendingOrders : []

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
          <Button
            onClick={() =>
              openMockDialog({
                pageName,
                route,
                componentName: '抢单',
                interactionName: '骑手抢单',
                title: '选择抢单结果',
                description: '模拟骑手参与抢单后的系统反馈。',
                options: [
                  {
                    id: 'grab-success',
                    title: '抢单成功',
                    description: '订单分配给当前骑手。',
                    badge: 'success',
                    noticeMessage: '抢单成功，请尽快前往商家。',
                  },
                  {
                    id: 'grab-failed',
                    title: '抢单失败',
                    description: '该订单已被其他骑手抢到。',
                    badge: 'warning',
                  },
                ],
                onSelect: () => undefined,
              })
            }
          >
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
                  onClick={() =>
                    openMockDialog({
                      pageName,
                      route,
                      componentName: `订单-${order.id}-导航`,
                      interactionName: '第三方地图导航',
                      title: `选择订单 ${order.id} 导航结果`,
                      description: '模拟跳转第三方地图 App 进行导航。',
                      options: [
                        {
                          id: 'nav-success',
                          title: '导航启动成功',
                          description: '已跳转到第三方地图并规划最优路线。',
                          badge: 'success',
                          noticeMessage: '导航已启动。',
                        },
                        {
                          id: 'nav-failed',
                          title: '导航启动失败',
                          description: '未检测到地图应用，请改用网页导航。',
                          badge: 'warning',
                        },
                      ],
                      onSelect: () => undefined,
                    })
                  }
                >
                  <Navigation className="size-4" />
                  去导航
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    openMockDialog({
                      pageName,
                      route,
                      componentName: `订单-${order.id}-状态`,
                      interactionName: '更新配送状态',
                      title: `选择订单 ${order.id} 状态更新`,
                      description: '模拟骑手更新订单配送状态。',
                      options: [
                        {
                          id: 'status-picking',
                          title: '已取餐',
                          description: '订单状态更新为配送中。',
                          badge: 'success',
                          noticeMessage: '已更新为配送中。',
                        },
                        {
                          id: 'status-complete',
                          title: '已送达',
                          description: '订单完成并记录履约时间。',
                          badge: 'success',
                          noticeMessage: '订单已完成。',
                        },
                      ],
                      onSelect: () => undefined,
                    })
                  }
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
