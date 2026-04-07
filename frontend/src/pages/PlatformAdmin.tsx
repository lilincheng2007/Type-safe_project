import { BadgeAlert, CircleDollarSign, Handshake, Megaphone, UserCog } from 'lucide-react'
import { useEffect, useState } from 'react'

import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppChrome } from '@/hooks/useAppChrome'
import type { PlatformMetaResponse } from '@/delivery/model/api'
import { fetchPlatformMetaIO, runTask } from '@/api'

export default function PlatformAdmin() {
  const { showNotice } = useAppChrome()
  const [meta, setMeta] = useState<PlatformMetaResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await runTask(fetchPlatformMetaIO())
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
              onClick={() => showNotice('商家入驻审核由后端 API 提供后再接线。', 'info')}
            >
              <Handshake className="size-4" />
              审核入驻申请
            </Button>
            <Button
              variant="outline"
              onClick={() => showNotice('活动发放由后端 API 提供后再接线。', 'info')}
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
              onClick={() => showNotice('投诉工单处理由后端 API 提供后再接线。', 'info')}
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
