import { Bike, BriefcaseBusiness, ClipboardList, Store, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { FloatingPageTools } from '@/components/FloatingPageTools'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ComplaintTicket, PromotionCampaign } from '@/delivery/model'
import { useAppChrome } from '@/hooks/useAppChrome'
import type { PageToolEvent } from '@/lib/mock-types'
import type { OverviewResponse } from '@/delivery/model/api'
import { fetchOverviewIO } from '@/admin/api/OverviewApi'
import { runTask } from '@/shared/http/client'

const entries = [
  {
    title: '顾客端',
    description: '浏览商品、下单与支付、查看配送轨迹',
    path: '/delivery/customer',
    icon: UserRound,
  },
  {
    title: '商家端',
    description: '管理商品、处理订单、查看营业概况',
    path: '/delivery/merchant',
    icon: Store,
  },
  {
    title: '骑手端',
    description: '抢单/派单、查看导航、更新配送状态',
    path: '/delivery/rider',
    icon: Bike,
  },
  {
    title: '订单中心',
    description: '统一处理订单状态流转与派单策略',
    path: '/delivery/orders',
    icon: ClipboardList,
  },
  {
    title: '运营与客服后台',
    description: '商家审核、活动发放、投诉处理与平台治理',
    path: '/delivery/admin',
    icon: BriefcaseBusiness,
  },
] as const

export default function DeliveryDashboard() {
  const navigate = useNavigate()
  const { showNotice } = useAppChrome()
  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await runTask(fetchOverviewIO())
        if (!cancelled) setOverview(data)
      } catch (e) {
        if (!cancelled) setOverviewError(e instanceof Error ? e.message : '加载失败')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const merchants = overview?.merchants ?? []
  const orders = overview?.orders ?? []
  const riders = overview?.riders ?? []
  const campaigns = overview?.campaigns ?? []
  const complaintTickets = overview?.complaintTickets ?? []

  const pageEvents: PageToolEvent[] = [
    {
      id: 'push-status',
      label: '发送状态推送',
      description: '订单状态变更后的通知能力由后端消息服务与 API 提供。',
    },
    {
      id: 'daily-settlement',
      label: '日结对账',
      description: '财务结算任务由后端批处理与 API 提供。',
    },
  ]

  return (
    <DeliveryPageShell
      title="外卖平台 - 业务总览"
      description="演示型外卖平台总览：覆盖顾客、商家、骑手与平台运营等核心角色。"
    >
      <FloatingPageTools
        events={pageEvents}
        onEventSelect={(event) => showNotice(`${event.label}：${event.description}`, 'info')}
      />

      {overviewError ? (
        <Card className="border-rose-200 bg-rose-50/90">
          <CardContent className="p-4 text-sm text-rose-800">{overviewError}</CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>商家数量</CardDescription>
            <CardTitle>{merchants.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>骑手在线</CardDescription>
            <CardTitle>{riders.filter((item) => item.status !== '空闲').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>今日订单</CardDescription>
            <CardTitle>{orders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>待处理投诉</CardDescription>
            <CardTitle>{complaintTickets.filter((item: ComplaintTicket) => item.status !== '已解决').length}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {entries.map((entry) => {
          const Icon = entry.icon
          return (
            <Card key={entry.title} className="border-orange-100 bg-white/95 py-0">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h2 className="font-semibold text-slate-900">{entry.title}</h2>
                      <p className="text-sm text-slate-600">{entry.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-orange-100 text-orange-700">
                    核心模块
                  </Badge>
                </div>
                <Button className="w-full" onClick={() => navigate(entry.path)}>
                  进入模块
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle>当前活动概况</CardTitle>
          <CardDescription>运营经理已规划的促销活动</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaigns.map((campaign: PromotionCampaign) => (
            <div
              key={campaign.id}
              className="flex items-center justify-between rounded-xl border border-orange-100 px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-900">{campaign.title}</p>
                <p className="text-sm text-slate-600">面向：{campaign.target}</p>
              </div>
              <Badge variant="outline">{campaign.status}</Badge>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => showNotice('新增活动由后端 API 提供后再接线。', 'info')}
          >
            新增活动
          </Button>
        </CardContent>
      </Card>
    </DeliveryPageShell>
  )
}
