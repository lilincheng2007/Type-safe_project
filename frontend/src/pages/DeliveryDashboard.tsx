import { Bike, BriefcaseBusiness, ClipboardList, Store, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { FloatingPageTools } from '@/components/FloatingPageTools'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMockSystem } from '@/hooks/useMockSystem'
import { campaigns, complaintTickets, merchants, orders, riders } from '@/lib/delivery-data'
import type { PageEventDefinition } from '@/lib/mock-types'

const pageName = '外卖平台总览'
const route = '/delivery/dashboard'

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
  const { openMockDialog, showNotice } = useMockSystem()

  const pageEvents: PageEventDefinition[] = [
    {
      id: 'push-status',
      label: '发送状态推送',
      description: '模拟订单状态变更后触发短信/APP 消息推送。',
      dialog: {
        pageName,
        route,
        eventName: '发送状态推送',
        interactionName: '消息推送服务',
        title: '选择消息推送结果',
        description: '模拟订单状态变化后平台发送通知的结果。',
        options: [
          {
            id: 'push-success',
            title: '推送成功',
            description: '顾客、商家、骑手均收到状态更新。',
            badge: 'success',
            noticeMessage: '通知已送达目标用户。',
          },
          {
            id: 'push-delay',
            title: '推送延迟',
            description: '部分用户通知延迟，系统稍后重试。',
            badge: 'warning',
          },
          {
            id: 'push-failed',
            title: '推送失败',
            description: '消息网关异常，触发告警。',
            badge: 'error',
          },
        ],
        onSelect: () => undefined,
      },
    },
    {
      id: 'daily-settlement',
      label: '日结对账',
      description: '模拟平台对商家加盟费与骑手薪资进行日结。',
      dialog: {
        pageName,
        route,
        eventName: '日结对账',
        interactionName: '财务结算任务',
        title: '选择日结任务结果',
        description: '模拟每日结算任务执行后的结果。',
        options: [
          {
            id: 'settlement-success',
            title: '结算成功',
            description: '商家费用与骑手薪资已更新。',
            badge: 'success',
            noticeMessage: '日结任务完成。',
          },
          {
            id: 'settlement-partial',
            title: '部分失败',
            description: '少量账单异常，已进入人工复核。',
            badge: 'warning',
          },
        ],
        onSelect: () => undefined,
      },
    },
  ]

  return (
    <DeliveryPageShell
      title="外卖平台 - 业务总览"
      description="基于图书馆系统模版重构为外卖平台，覆盖顾客、商家、骑手、运营经理和客服等核心角色。"
    >
      <FloatingPageTools events={pageEvents} onEventSelect={(event) => openMockDialog(event.dialog)} />

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
            <CardTitle>{complaintTickets.filter((item) => item.status !== '已解决').length}</CardTitle>
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
          {campaigns.map((campaign) => (
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
            onClick={() =>
              openMockDialog({
                pageName,
                route,
                componentName: '新增活动',
                interactionName: '运营活动创建',
                title: '选择活动创建结果',
                description: '模拟运营经理新增平台促销活动的后续结果。',
                options: [
                  {
                    id: 'campaign-created',
                    title: '创建成功',
                    description: '活动已进入待发布状态。',
                    badge: 'success',
                    noticeMessage: '活动创建成功。',
                  },
                  {
                    id: 'campaign-rejected',
                    title: '审核驳回',
                    description: '活动预算超过上限，需要重新提交。',
                    badge: 'warning',
                  },
                ],
                onSelect: (option) => {
                  if (option.id === 'campaign-created') {
                    showNotice('已创建新的促销活动草案。', 'success')
                  }
                },
              })
            }
          >
            新增活动
          </Button>
        </CardContent>
      </Card>
    </DeliveryPageShell>
  )
}
