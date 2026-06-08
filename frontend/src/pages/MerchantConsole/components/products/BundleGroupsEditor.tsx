import { useState } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { bundleOptionExtraPrice } from '@/lib/bundles'
import { cn } from '@/lib/utils'
import type { Product, ProductBundleGroup } from '@/objects/merchant/Product'

import {
  bundleGroupTypes,
  createBundleGroup,
  hasCustomBundleExtraPrice,
  isBundleProduct,
  maxBundleOptionPrice,
} from '../../functions/productFormMapping'

export function BundleGroupsEditor({
  groups,
  products,
  onChange,
}: {
  groups: ProductBundleGroup[]
  products: Product[]
  onChange: (groups: ProductBundleGroup[]) => void
}) {
  const normalProducts = products.filter((product) => !isBundleProduct(product))
  const [selectionDraft, setSelectionDraft] = useState<{ group: ProductBundleGroup; productIds: string[] } | null>(null)

  const updateGroup = (groupId: string, patch: Partial<ProductBundleGroup>) => {
    onChange(groups.map((group) => group.id === groupId ? { ...group, ...patch } : group))
  }

  const upsertGroup = (nextGroup: ProductBundleGroup) => {
    const exists = groups.some((group) => group.id === nextGroup.id)
    onChange(exists ? groups.map((group) => group.id === nextGroup.id ? nextGroup : group) : [...groups, nextGroup])
  }

  const openSelectionPage = (group: ProductBundleGroup) => {
    setSelectionDraft({ group, productIds: group.options.map((option) => option.productId) })
  }

  const handleAddGroup = () => {
    const group = createBundleGroup()
    onChange([...groups, group])
    openSelectionPage(group)
  }

  const toggleDraftProduct = (productId: string) => {
    setSelectionDraft((draft) => {
      if (!draft) return draft
      const selected = draft.productIds.includes(productId)
      return {
        ...draft,
        productIds: selected ? draft.productIds.filter((id) => id !== productId) : [...draft.productIds, productId],
      }
    })
  }

  const confirmSelection = () => {
    if (!selectionDraft) return
    const currentGroup = groups.find((group) => group.id === selectionDraft.group.id) ?? selectionDraft.group
    const previousOptions = currentGroup.options
    const nextOptions = selectionDraft.productIds.map((productId) => {
      const existing = previousOptions.find((option) => option.productId === productId)
      return existing ?? { productId, recommended: false, extraPrice: 0, customExtraPrice: false }
    })
    const hasCustomExtraPrice = nextOptions.some((option) => option.customExtraPrice)
    const defaultIncludedPrice = maxBundleOptionPrice(nextOptions, normalProducts)
    const includedPrice = hasCustomExtraPrice ? 0 : (currentGroup.includedPrice > 0 ? currentGroup.includedPrice : defaultIncludedPrice)
    const normalizedOptions = nextOptions.map((option) => ({
      ...option,
      extraPrice: option.customExtraPrice ? Math.max(0, option.extraPrice || 0) : 0,
    }))
    const selectionType = currentGroup.selectionType ?? 'repeatable'
    upsertGroup({
      ...currentGroup,
      selectionType,
      includedPrice,
      quantity: selectionType === 'fixed' ? Math.max(1, normalizedOptions.length) : currentGroup.quantity,
      options: normalizedOptions,
    })
    setSelectionDraft(null)
  }

  const updateOption = (group: ProductBundleGroup, productId: string, patch: Partial<ProductBundleGroup['options'][number]>) => {
    updateGroup(group.id, {
      options: group.options.map((option) => option.productId === productId ? { ...option, ...patch } : option),
    })
  }

  const removeOption = (group: ProductBundleGroup, productId: string) => {
    const nextOptions = group.options.filter((option) => option.productId !== productId)
    const hasCustomExtraPrice = nextOptions.some((option) => option.customExtraPrice)
    updateGroup(group.id, {
      options: nextOptions,
      includedPrice: hasCustomExtraPrice ? 0 : group.includedPrice,
      quantity: group.selectionType === 'fixed' ? Math.max(1, nextOptions.length) : group.quantity,
    })
  }

  const updateIncludedPrice = (group: ProductBundleGroup, includedPrice: number) => {
    updateGroup(group.id, {
      includedPrice: Math.max(0, includedPrice),
      options: group.options.map((option) => ({ ...option, extraPrice: 0, customExtraPrice: false })),
    })
  }

  const updateOptionExtraPrice = (group: ProductBundleGroup, productId: string, extraPrice: number) => {
    updateGroup(group.id, {
      includedPrice: 0,
      options: group.options.map((option) => option.productId === productId ? { ...option, extraPrice: Math.max(0, extraPrice), customExtraPrice: true } : option),
    })
  }

  return (
    <div className="space-y-3 rounded-2xl border border-orange-100 bg-orange-50/50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">套餐类别</p>
          <p className="text-xs text-slate-500">添加类别后进入菜品选择页，确认后在套餐中展示并可继续编辑。</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={handleAddGroup}>
          <Plus className="size-4" />
          添加类别
        </Button>
      </div>
      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-orange-200 bg-white/70 px-3 py-3 text-sm text-slate-500">
          还没有套餐类别，点击添加类别后选择已有菜品组成套餐。
        </p>
      ) : null}
      {groups.map((group) => {
        const hasCustomExtraPrice = hasCustomBundleExtraPrice(group)
        const includedPrice = Number.isFinite(group.includedPrice) ? group.includedPrice : 0
        return (
          <div key={group.id} className="space-y-3 rounded-xl border border-orange-100 bg-white p-3">
            <div className="space-y-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[18rem] flex-1 space-y-1">
                  <Label>类别名称</Label>
                  <Input value={group.name} onChange={(event) => updateGroup(group.id, { name: event.target.value })} />
                </div>
                <Button type="button" variant="outline" className="text-rose-600" onClick={() => onChange(groups.filter((item) => item.id !== group.id))}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-[12rem_8rem_10rem] sm:items-end">
                <div className="space-y-1">
                  <Label>类别类型</Label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={group.selectionType ?? 'repeatable'}
                    onChange={(event) => {
                      const selectionType = event.target.value as ProductBundleGroup['selectionType']
                      updateGroup(group.id, { selectionType, quantity: selectionType === 'fixed' ? Math.max(1, group.options.length) : group.quantity })
                    }}
                  >
                    {bundleGroupTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>{group.selectionType === 'fixed' ? '指定件数' : '可选件数'}</Label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    disabled={group.selectionType === 'fixed'}
                    value={group.selectionType === 'fixed' ? Math.max(1, group.options.length) : group.quantity}
                    onChange={(event) => updateGroup(group.id, { quantity: Number(event.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>包含价</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={hasCustomExtraPrice ? '输入后替换加价' : undefined}
                    value={hasCustomExtraPrice ? '' : includedPrice}
                    onChange={(event) => updateIncludedPrice(group, Number(event.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-700">已添加菜品 {group.options.length} 个</p>
              <Button type="button" size="sm" variant="outline" onClick={() => openSelectionPage(group)}>
                {group.options.length > 0 ? '添加/编辑菜品' : '添加菜品'}
              </Button>
            </div>

            {group.options.length === 0 ? (
              <p className="rounded-xl border border-dashed border-orange-100 px-3 py-3 text-sm text-slate-500">还没有选择菜品。</p>
            ) : null}

            <div className="grid gap-2 md:grid-cols-2">
              {group.options.map((option) => {
                const product = normalProducts.find((item) => item.id === option.productId)
                if (!product) return null
                const extraPrice = bundleOptionExtraPrice(group, product)
                return (
                  <div key={option.productId} className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate font-medium text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">原价 ¥{product.price.toFixed(2)}</p>
                      </div>
                      <Button type="button" size="sm" variant="outline" className="shrink-0 text-rose-600" onClick={() => removeOption(group, product.id)}>
                        删除
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Label className="text-xs">加价</Label>
                      <Input
                        className="h-8 w-28"
                        type="number"
                        min="0"
                        step="0.01"
                        value={extraPrice}
                        onChange={(event) => updateOptionExtraPrice(group, product.id, Number(event.target.value) || 0)}
                      />
                      <span className="text-xs text-slate-500">{extraPrice <= 0 ? '不加价' : `+¥${extraPrice.toFixed(2)}`}</span>
                      <label className="ml-auto flex shrink-0 items-center gap-1 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          className="size-3.5 accent-orange-500"
                          checked={option.recommended ?? false}
                          onChange={(event) => updateOption(group, product.id, { recommended: event.target.checked })}
                        />
                        推荐
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <Dialog open={Boolean(selectionDraft)} onOpenChange={(open) => !open && setSelectionDraft(null)}>
        <DialogContent className="flex max-h-[min(42rem,calc(100vh-2rem))] max-w-3xl flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white p-0">
          <DialogHeader className="shrink-0 border-b border-orange-100 px-6 py-4">
            <DialogTitle>选择类别菜品</DialogTitle>
            <DialogDescription>选择要添加到该类别的菜品，确认后会显示在套餐中。</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-4">
            {normalProducts.length === 0 ? <p className="text-sm text-slate-500">暂无可选择的普通菜品。</p> : null}
            <div className="grid gap-2 md:grid-cols-2">
              {normalProducts.map((product) => {
                const checked = selectionDraft?.productIds.includes(product.id) ?? false
                return (
                  <button
                    key={product.id}
                    type="button"
                    className={cn(
                      'flex min-w-0 items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition-colors',
                      checked ? 'border-orange-300 bg-orange-50 text-orange-800' : 'border-slate-200 bg-white text-slate-700 hover:border-orange-200',
                    )}
                    onClick={() => toggleDraftProduct(product.id)}
                  >
                    <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full border', checked ? 'border-orange-400 bg-orange-400 text-white' : 'border-slate-300')}>
                      {checked ? <Check className="size-3.5" /> : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{product.name}</span>
                    <span className="shrink-0 text-xs text-slate-500">¥{product.price.toFixed(2)}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t border-orange-100 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setSelectionDraft(null)}>取消</Button>
            <Button type="button" onClick={confirmSelection} disabled={!selectionDraft || selectionDraft.productIds.length === 0}>确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
