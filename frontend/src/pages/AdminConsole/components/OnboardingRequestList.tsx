import { CheckCircle2, ChevronDown, ChevronUp, RefreshCw, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { StoreOnboardingRequest } from '@/objects/admin/StoreOnboardingRequest'

import { CollapsedListLimit, formatDate } from '../functions/adminFormatters'
import { statusBadgeVariant, statusLabels } from '../functions/statusBadges'

type OnboardingRequestListProps = {
  requests: StoreOnboardingRequest[]
  displayedRequests: StoreOnboardingRequest[]
  pendingCount: number
  isLoading: boolean
  errorMessage: string | null
  processingId: string | null
  showAllOnboardingRequests: boolean
  onRefresh: () => void
  onAccept: (requestId: string) => void
  onStartReject: (request: StoreOnboardingRequest) => void
  onToggleShowAll: (showAll: boolean) => void
}

export function OnboardingRequestList({
  requests,
  displayedRequests,
  pendingCount,
  isLoading,
  errorMessage,
  processingId,
  showAllOnboardingRequests,
  onRefresh,
  onAccept,
  onStartReject,
  onToggleShowAll,
}: OnboardingRequestListProps) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">店铺入驻审核</h3>
          <p className="mt-1 text-sm text-slate-500">待审核 {pendingCount} 个，共 {requests.length} 个申请</p>
        </div>
        <Button type="button" variant="outline" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className="size-4" />
          刷新
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? <p className="text-sm text-slate-500">加载中…</p> : null}
        {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
        {!isLoading && !errorMessage && requests.length === 0 ? (
          <p className="text-sm text-slate-500">暂无店铺入驻申请。</p>
        ) : null}

        {displayedRequests.map((request) => (
          <article key={request.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-semibold text-slate-950">{request.storeName}</h4>
                  <Badge variant={statusBadgeVariant(request.status)}>{statusLabels[request.status]}</Badge>
                </div>
                <p className="text-sm text-slate-600">{request.address}</p>
                <p className="text-sm text-slate-500">申请商家：{request.ownerUsername}</p>
              </div>
              {request.status === 'pending' ? (
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onAccept(request.id)}
                    disabled={processingId === request.id}
                  >
                    <CheckCircle2 className="size-4" />
                    通过
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onStartReject(request)}
                    disabled={processingId === request.id}
                  >
                    <XCircle className="size-4" />
                    驳回
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-[1fr_14rem]">
              <p className="leading-6">{request.description}</p>
              <div className="space-y-1 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
                <p>提交时间：{formatDate(request.createdAt)}</p>
                <p>审核时间：{formatDate(request.reviewedAt)}</p>
                {request.reviewedBy ? <p>审核人：{request.reviewedBy}</p> : null}
                {request.rejectionReason ? <p className="text-rose-600">驳回原因：{request.rejectionReason}</p> : null}
              </div>
            </div>
          </article>
        ))}

        {!showAllOnboardingRequests && requests.length > CollapsedListLimit ? (
          <Button type="button" variant="ghost" className="mx-auto flex cursor-pointer text-slate-500" onClick={() => onToggleShowAll(true)}>
            更多
            <ChevronDown className="size-4" />
          </Button>
        ) : null}

        {showAllOnboardingRequests && requests.length > CollapsedListLimit ? (
          <Button type="button" variant="ghost" className="mx-auto flex cursor-pointer text-slate-500" onClick={() => onToggleShowAll(false)}>
            收起
            <ChevronUp className="size-4" />
          </Button>
        ) : null}
      </div>
    </>
  )
}
