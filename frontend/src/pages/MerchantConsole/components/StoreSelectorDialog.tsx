import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { MerchantStoreProfile } from '@/objects/merchant/MerchantStoreProfile'
import type { StoreOnboardingRequest, StoreOnboardingStatus } from '@/objects/admin/StoreOnboardingRequest'
import { storeTagOptions } from '../objects/storeTags'

const statusLabels: Record<StoreOnboardingStatus, string> = {
  pending: '待审批',
  accepted: '已通过',
  rejected: '已驳回',
}

function statusVariant(status: StoreOnboardingStatus) {
  if (status === 'accepted') return 'default'
  if (status === 'rejected') return 'destructive'
  return 'outline'
}

function formatDate(value: string | null | undefined) {
  if (!value) return '暂无'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

type StoreSelectorDialogProps = {
  open: boolean
  selectedStoreId: string | null
  newStoreName: string
  newStoreAddress: string
  newStoreDescription: string
  newStoreTags: string[]
  stores: MerchantStoreProfile[]
  storeOnboardingRequests: StoreOnboardingRequest[]
  onOpenChange: (open: boolean) => void
  onSelectStore: (storeId: string) => void
  onChangeStoreName: (value: string) => void
  onChangeStoreAddress: (value: string) => void
  onChangeStoreDescription: (value: string) => void
  onChangeStoreTags: (value: string[]) => void
  onEnterSelectedStore: () => void
  onCreateStore: () => void
}

export function StoreSelectorDialog({
  open,
  selectedStoreId,
  newStoreName,
  newStoreAddress,
  newStoreDescription,
  newStoreTags,
  stores,
  storeOnboardingRequests,
  onOpenChange,
  onSelectStore,
  onChangeStoreName,
  onChangeStoreAddress,
  onChangeStoreDescription,
  onChangeStoreTags,
  onEnterSelectedStore,
  onCreateStore,
}: StoreSelectorDialogProps) {
  const selectedStoreTags = new Set(newStoreTags)
  const toggleStoreTag = (tag: string) => {
    onChangeStoreTags(selectedStoreTags.has(tag) ? newStoreTags.filter((item) => item !== tag) : [...newStoreTags, tag])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(92vh,46rem)] w-[min(42rem,calc(100vw-2rem))] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-2xl border border-orange-100 bg-white p-0">
        <DialogHeader className="border-b border-orange-100 px-5 py-4 pr-12 sm:px-6">
          <DialogTitle>选择店铺</DialogTitle>
          <DialogDescription>可选择已入驻店铺，或提交新店铺入驻申请。</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-900">已有店铺</p>
              <div className="grid gap-2">
                {stores.length === 0 ? (
                  <p className="text-sm text-slate-500">暂无已入驻店铺，请先提交申请并等待管理员审核。</p>
                ) : (
                  stores.map((storeItem) => (
                    <button
                      key={storeItem.merchant.id}
                      type="button"
                      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                        selectedStoreId === storeItem.merchant.id
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-orange-100 hover:bg-orange-50/60'
                      }`}
                      onClick={() => onSelectStore(storeItem.merchant.id)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="break-words font-medium text-slate-900">{storeItem.merchant.storeName}</p>
                        <Badge variant="outline">{storeItem.merchant.category}</Badge>
                      </div>
                      <p className="mt-1 break-words text-xs text-slate-500">{storeItem.merchant.address}</p>
                      {storeItem.merchant.tags.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {storeItem.merchant.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[11px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </button>
                  ))
                )}
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={onEnterSelectedStore} disabled={!selectedStoreId}>
                  进入所选店铺
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-900">入驻申请记录</p>
              <div className="grid gap-2">
                {storeOnboardingRequests.length === 0 ? (
                  <p className="text-sm text-slate-500">暂无入驻申请记录。</p>
                ) : (
                  storeOnboardingRequests.map((request) => (
                    <details key={request.id} className="group rounded-xl border border-slate-200 bg-slate-50/70">
                      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-4 py-3 marker:hidden">
                        <div className="min-w-0">
                          <p className="break-words font-medium text-slate-900">{request.storeName}</p>
                          <p className="mt-1 break-words text-xs text-slate-500">{request.address}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant={statusVariant(request.status)}>{statusLabels[request.status]}</Badge>
                          <span className="text-xs text-slate-400 group-open:hidden">展开</span>
                          <span className="hidden text-xs text-slate-400 group-open:inline">收起</span>
                        </div>
                      </summary>
                      <div className="border-t border-slate-200 px-4 py-3">
                        <p className="break-words text-sm leading-6 text-slate-600">{request.description}</p>
                        {request.tags.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {request.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[11px]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                        <div className="mt-3 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
                          <p>提交时间：{formatDate(request.createdAt)}</p>
                          <p>审核时间：{formatDate(request.reviewedAt)}</p>
                        </div>
                        {request.status === 'rejected' ? (
                          <p className="mt-3 break-words rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            驳回原因：{request.rejectionReason || '管理员未填写原因'}
                          </p>
                        ) : null}
                      </div>
                    </details>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-dashed border-orange-200 p-4">
              <p className="text-sm font-medium text-slate-900">申请新店铺入驻</p>
              <div className="space-y-2">
                <Label htmlFor="create-store-name">店铺名称</Label>
                <Input
                  id="create-store-name"
                  value={newStoreName}
                  placeholder="请输入店铺名称"
                  onChange={(event) => onChangeStoreName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-store-address">店铺地址</Label>
                <Input
                  id="create-store-address"
                  value={newStoreAddress}
                  placeholder="请输入店铺地址"
                  onChange={(event) => onChangeStoreAddress(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-store-description">店铺描述</Label>
                <Textarea
                  id="create-store-description"
                  value={newStoreDescription}
                  placeholder="请介绍店铺特色、主营品类或服务能力"
                  className="min-h-24 resize-y"
                  onChange={(event) => onChangeStoreDescription(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>店铺标签</Label>
                <div className="flex flex-wrap gap-2">
                  {storeTagOptions.map((tag) => {
                    const isSelected = selectedStoreTags.has(tag)
                    return (
                      <Button
                        key={tag}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className={isSelected ? 'border-orange-500 bg-orange-500 text-white hover:bg-orange-600' : 'border-orange-200 text-slate-700 hover:bg-orange-50'}
                        onClick={() => toggleStoreTag(tag)}
                      >
                        {tag}
                      </Button>
                    )
                  })}
                </div>
                <p className="text-xs text-slate-500">至少选择一个标签，可多选。</p>
              </div>
              <Button type="button" variant="outline" onClick={onCreateStore}>
                提交入驻申请
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-orange-100 px-5 py-4 sm:px-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
