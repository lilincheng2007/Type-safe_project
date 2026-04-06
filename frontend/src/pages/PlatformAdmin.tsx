import { BadgeAlert, CircleDollarSign, Handshake, Megaphone, UserCog } from 'lucide-react'
import { useEffect, useState } from 'react'

import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMockSystem } from '@/hooks/useMockSystem'
import { fetchPlatformMeta, type PlatformMetaResponse } from '@/lib/api/deliveryApi'

const pageName = '平台管理后台'
const route = '/delivery/admin'

export default function PlatformAdmin() {
  const { openMockDialog } = useMockSystem()
  const [meta, setMeta] = useState<PlatformMetaResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchPlatformMeta()
        if (!cancelled) setMeta(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '加载失败')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const operationsManagers = meta?.operationsManagers ?? []
  const serviceAgents = meta?.serviceAgents ?? []
  const merchantApplications = meta?.merchantApplications ?? []
  const complaintTickets = meta?.complaintTickets ?? []
  const campaigns = meta?.campaigns ?? []
  const ops = operationsManagers[0]
  const csAgent = serviceAgents[0]

  return (
    <DeliveryPageShell
      title="平台后端与管理系统"
      description="包含运营经理后台、客服后台和基础管理能力：商家审核、活动发放、加盟费收取、投诉处理等。"
      roleBadge="管理后台"
    >
      {error ? (
        <Card className="border-rose-200 bg-rose-50/90">
          <CardContent className="p-4 text-sm text-rose-800">{error}</CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-orange-100 bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="size-5 text-orange-500" />
              运营经理信息
            </CardTitle>
            <CardDescription>
              {ops
                ? `${ops.name} · 区域 ${ops.region} · 管辖商家 ${ops.managedMerchantIds.length}`
                : '暂无数据'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() =>
                openMockDialog({
                  pageName,
                  route,
                  componentName: '商家入驻审核',
                  interactionName: '审核新商家',
                  title: '选择商家入驻审核结果',
                  description: '模拟运营经理对入驻申请的审核流程。',
                  options: [
                    {
                      id: 'merchant-approved',
                      title: '审核通过',
                      description: '新商家入驻成功并进入待配置状态。',
                      badge: 'success',
                      noticeMessage: '商家已通过审核。',
                    },
                    {
                      id: 'merchant-rejected',
                      title: '审核拒绝',
                      description: '资料不完整或经营资质不合规。',
                      badge: 'warning',
                    },
                  ],
                  onSelect: () => undefined,
                })
              }
            >
              <Handshake className="size-4" />
              审核入驻申请
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                openMockDialog({
                  pageName,
                  route,
                  componentName: '发放优惠活动',
                  interactionName: '运营活动发放',
                  title: '选择活动发放结果',
                  description: '模拟运营经理发放优惠活动给指定用户或商家。',
                  options: [
                    {
                      id: 'campaign-publish-success',
                      title: '发放成功',
                      description: '活动已下发到目标用户。',
                      badge: 'success',
                      noticeMessage: '优惠活动已发放。',
                    },
                    {
                      id: 'campaign-publish-failed',
                      title: '发放失败',
                      description: '活动条件配置错误，未通过校验。',
                      badge: 'error',
                    },
                  ],
                  onSelect: () => undefined,
                })
              }
            >
              <Megaphone className="size-4" />
              发放活动
            </Button>
          </CardContent>
        </Card>

        <Card className="border-orange-100 bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeAlert className="size-5 text-orange-500" />
              客服信息
            </CardTitle>
            <CardDescription>
              {csAgent
                ? `${csAgent.name} · ${csAgent.department} · 渠道 ${csAgent.channel}`
                : '暂无数据'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() =>
                openMockDialog({
                  pageName,
                  route,
                  componentName: '处理投诉',
                  interactionName: '客服工单处理',
                  title: '选择投诉处理结果',
                  description: '模拟客服处理投诉后对订单或骑手的影响。',
                  options: [
                    {
                      id: 'ticket-resolved',
                      title: '投诉已解决',
                      description: '工单关闭并完成用户回访。',
                      badge: 'success',
                      noticeMessage: '投诉已处理完成。',
                    },
                    {
                      id: 'cancel-order',
                      title: '取消订单并退款',
                      description: '根据投诉严重程度取消订单。',
                      badge: 'warning',
                    },
                    {
                      id: 'deduct-rider-salary',
                      title: '扣除骑手薪资',
                      description: '违规配送触发骑手扣款流程。',
                      badge: 'warning',
                    },
                  ],
                  onSelect: () => undefined,
                })
              }
            >
              处理咨询 / 投诉
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-orange-100 bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleDollarSign className="size-5 text-orange-500" />
              商家加盟费收取
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-700">当前待缴纳加盟费商家：{merchantApplications.length} 家</p>
            <Button variant="outline">发起收款</Button>
          </CardContent>
        </Card>

        <Card className="border-orange-100 bg-white/95">
          <CardHeader>
            <CardTitle>基础管理后台数据</CardTitle>
            <CardDescription>商家申请、投诉工单、活动计划</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-xl border border-orange-100 p-3">
              <span>待审核商家</span>
              <Badge variant="outline">{merchantApplications.filter((item) => item.status === '待审核').length}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-orange-100 p-3">
              <span>未解决工单</span>
              <Badge variant="outline">{complaintTickets.filter((item) => item.status !== '已解决').length}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-orange-100 p-3">
              <span>进行中活动</span>
              <Badge variant="outline">{campaigns.filter((item) => item.status === '进行中').length}</Badge>
            </div>
          </CardContent>
        </Card>
      </section>
    </DeliveryPageShell>
  )
}
