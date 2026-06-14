import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronDown, ChevronUp, ReceiptText, RefreshCw, TicketPercent, XCircle } from 'lucide-react'

import { DeliveryLogoutBar } from '@/components/DeliveryLogoutBar'
import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAppChrome } from '@/hooks/useAppChrome'
import { resolveApiMediaUrl } from '@/lib/api-media-url'
import { RefundStatuses } from '@/objects/shared/ids'
import { promotionUsageText } from '@/components/PromotionEditorCard'
import { promotionSummary } from '@/lib/promotions'
import { cn } from '@/lib/utils'

import { AdminMetricCards } from './components/AdminMetricCards'
import { MonitorOrderList } from './components/MonitorOrderList'
import { OnboardingRequestList } from './components/OnboardingRequestList'
import { RefundReviewDialog } from './components/RefundReviewDialog'
import { CollapsedListLimit, formatDate } from './functions/adminFormatters'
import { refundStatusBadgeVariant, refundStatusLabels } from './functions/statusBadges'
import { useAdminConsoleData } from './hooks/useAdminConsoleData'

export default function AdminConsole() {
  const navigate = useNavigate()
  const { showNotice } = useAppChrome()

  const {
    orderMonitor,
    platformPromotions,
    requests,
    displayedRequests,
    pendingCount,
    isLoading,
    errorMessage,
    orderMonitorError,
    platformPromotionsError,
    processingId,
    showAllOnboardingRequests,
    refundRequests,
    displayedRefundRequests,
    refundPendingCount,
    showAllRefundRequests,
    rejectingRequest,
    rejectionReason,
    reviewingRefund,
    refundReviewReason,
    setRejectingRequest,
    setRejectionReason,
    setShowAllOnboardingRequests,
    setShowAllRefundRequests,
    setRefundReviewReason,
    closeRefundReviewDialog,
    openRefundReviewDialog,
    loadRequests,
    handleAccept,
    handleReject,
    handleRefundReview,
  } = useAdminConsoleData(showNotice)

  return (
    <DeliveryPageShell>
      <Card className="border-slate-200 bg-white/95 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="size-5 text-orange-500" />
              订单监控
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">实时汇总今日经营、待处理退款、异常与超时订单。</p>
          </div>
          <Button type="button" variant="outline" onClick={() => void loadRequests()} disabled={isLoading}>
            <RefreshCw className="size-4" />
            刷新
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderMonitorError ? <p className="text-sm text-rose-600">{orderMonitorError}</p> : null}
          {isLoading && !orderMonitor ? <p className="text-sm text-slate-500">加载订单监控中…</p> : null}
          {orderMonitor ? (
            <>
              <AdminMetricCards orderMonitor={orderMonitor} />
              <div className="grid gap-3 lg:grid-cols-2">
                <MonitorOrderList title="待处理退款" items={orderMonitor.pendingRefunds} emptyText="暂无待处理退款。" />
                <MonitorOrderList title="异常订单" items={orderMonitor.abnormalOrders} emptyText="暂无异常订单。" />
                <MonitorOrderList title="商家超时订单" items={orderMonitor.merchantTimeoutOrders} emptyText="暂无商家超时订单。" />
                <MonitorOrderList title="骑手超时订单" items={orderMonitor.riderTimeoutOrders} emptyText="暂无骑手超时订单。" />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TicketPercent className="size-5 text-orange-500" />
              平台优惠
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">首页仅展示只读优惠信息；进入管理页后可新增、编辑并提交保存。</p>
          </div>
          <Button type="button" onClick={() => navigate('/delivery/admin/promotions')}>
            管理优惠
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {platformPromotionsError ? <p className="text-sm text-rose-600">{platformPromotionsError}</p> : null}
          {platformPromotions.length === 0 ? <p className="text-sm text-slate-500">当前未设置平台优惠。</p> : null}
          {platformPromotions.map((promotion) => {
            const usageText = promotionUsageText(promotion)
            return (
              <div
                key={promotion.id}
                className={cn(
                  'flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm',
                  promotion.enabled ? 'border-orange-100 bg-orange-50/60 text-orange-800' : 'border-slate-200 bg-slate-100 text-slate-500',
                )}
              >
                <Badge variant={promotion.enabled ? 'default' : 'outline'} className="shrink-0">
                  {promotion.enabled ? '启用' : '停用'}
                </Badge>
                <span className="shrink-0 font-semibold">{promotion.title}</span>
                <span className="min-w-0 flex-1 truncate">
                  {promotionSummary(promotion)}{usageText ? ` · ${usageText}` : ''}
                </span>
                <Button type="button" size="sm" variant="outline" className="shrink-0" onClick={() => navigate('/delivery/admin/promotions')}>
                  管理优惠
                </Button>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white/95">
        <CardContent className="space-y-4 pt-6">
          <OnboardingRequestList
            requests={requests}
            displayedRequests={displayedRequests}
            pendingCount={pendingCount}
            isLoading={isLoading}
            errorMessage={errorMessage}
            processingId={processingId}
            showAllOnboardingRequests={showAllOnboardingRequests}
            onRefresh={() => void loadRequests()}
            onAccept={(requestId) => void handleAccept(requestId)}
            onStartReject={(request) => {
              setRejectingRequest(request)
              setRejectionReason('')
            }}
            onToggleShowAll={setShowAllOnboardingRequests}
          />
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white/95">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>退款仲裁审核</CardTitle>
            <p className="mt-1 text-sm text-slate-500">待仲裁 {refundPendingCount} 个，共 {refundRequests.length} 个申请</p>
          </div>
          <Button type="button" variant="outline" onClick={() => void loadRequests()} disabled={isLoading}>
            <RefreshCw className="size-4" />
            刷新
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p className="text-sm text-slate-500">加载中…</p> : null}
          {!isLoading && refundRequests.length === 0 ? (
            <p className="text-sm text-slate-500">暂无退款申请。</p>
          ) : null}

          {displayedRefundRequests.map((order) => {
            const refundStatus = order.refundStatus ?? RefundStatuses.pending
            const isPendingRefund = refundStatus === RefundStatuses.adminPending
            return (
              <article key={order.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-950">订单 {order.id}</h2>
                      <Badge variant={refundStatusBadgeVariant(refundStatus)}>{refundStatusLabels[refundStatus]}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">顾客：{order.customerName} · {order.customerPhone}</p>
                    <p className="text-sm text-slate-600">退款金额：¥{order.payableAmount.toFixed(2)}</p>
                    <p className="text-sm text-slate-600">菜品：{order.items.map((item) => `${item.name}×${item.quantity}`).join('、')}</p>
                    {order.refundReason ? <p className="text-sm leading-6 text-slate-700">顾客理由：{order.refundReason}</p> : null}
                    {order.refundMerchantReason ? (
                      <p className="text-sm leading-6 text-orange-700">商家理由：{order.refundMerchantReason}</p>
                    ) : null}
                    {order.refundAdminReason ? (
                      <p className={order.refundStatus === RefundStatuses.rejected ? 'text-sm leading-6 text-rose-600' : 'text-sm leading-6 text-slate-700'}>
                        管理员反馈：{order.refundAdminReason}
                      </p>
                    ) : null}
                    {order.refundedAt ? <p className="text-sm text-slate-500">退款时间：{formatDate(order.refundedAt)}</p> : null}
                    {order.refundImageUrl ? (
                      <img
                        src={resolveApiMediaUrl(order.refundImageUrl)}
                        alt="退款凭证"
                        className="aspect-video w-full max-w-sm rounded-lg border border-slate-200 object-cover"
                      />
                    ) : null}
                  </div>
                  {isPendingRefund ? (
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => openRefundReviewDialog(order, 'accept')}
                        disabled={processingId === order.id}
                      >
                        <CheckCircle2 className="size-4" />
                        通过退款
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openRefundReviewDialog(order, 'reject')}
                        disabled={processingId === order.id}
                      >
                        <XCircle className="size-4" />
                        驳回
                      </Button>
                    </div>
                  ) : null}
                </div>
              </article>
            )
          })}

          {!showAllRefundRequests && refundRequests.length > CollapsedListLimit ? (
            <Button type="button" variant="ghost" className="mx-auto flex cursor-pointer text-slate-500" onClick={() => setShowAllRefundRequests(true)}>
              更多
              <ChevronDown className="size-4" />
            </Button>
          ) : null}

          {showAllRefundRequests && refundRequests.length > CollapsedListLimit ? (
            <Button type="button" variant="ghost" className="mx-auto flex cursor-pointer text-slate-500" onClick={() => setShowAllRefundRequests(false)}>
              收起
              <ChevronUp className="size-4" />
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={Boolean(rejectingRequest)} onOpenChange={(open) => !open && setRejectingRequest(null)}>
        <DialogContent className="max-h-[min(88vh,34rem)] w-[min(40rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl bg-white p-5 sm:p-6">
          <DialogHeader className="pr-8">
            <DialogTitle className="leading-6">填写驳回原因</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">驳回原因</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              className="min-h-40 resize-y break-words"
              placeholder="请输入需要商家修改或补充的信息"
              onChange={(event) => setRejectionReason(event.target.value)}
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setRejectingRequest(null)}>
              取消
            </Button>
            <Button type="button" onClick={() => void handleReject()} disabled={Boolean(processingId)}>
              确认驳回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RefundReviewDialog
        open={Boolean(reviewingRefund)}
        action={reviewingRefund?.action ?? null}
        reason={refundReviewReason}
        processing={Boolean(processingId)}
        onOpenChange={(open) => {
          if (!open) closeRefundReviewDialog()
        }}
        onReasonChange={setRefundReviewReason}
        onConfirm={() => void handleRefundReview()}
      />

      <DeliveryLogoutBar />
    </DeliveryPageShell>
  )
}
