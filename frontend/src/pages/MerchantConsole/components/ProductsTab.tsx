import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { ArrowLeft, Check, ImageIcon, PackageSearch, Plus, Save, Store, TicketPercent, Trash2, Upload } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PromotionEditorCard, createDefaultPromotion, defaultPromotionSchedule, promotionUsageText } from '@/components/PromotionEditorCard'
import { PromotionDateInput, PromotionEnableControl } from '@/components/PromotionControls'
import { useAppChrome } from '@/hooks/useAppChrome'
import { resolveApiMediaUrl } from '@/lib/api-media-url'
import { bundleOptionExtraPrice } from '@/lib/bundles'
import { getLocalImageFileError } from '@/lib/local-image-file'
import type { CreateProductRequest } from '@/objects/merchant/apiTypes/CreateProductRequest'
import type { MerchantStoreProfile } from '@/objects/merchant/MerchantStoreProfile'
import type { Product, ProductBundleGroup } from '@/objects/merchant/Product'
import type { UpdateProductRequest } from '@/objects/merchant/apiTypes/UpdateProductRequest'
import { ListingStatuses } from '@/objects/shared/ids'
import type { ListingStatus, ProductId } from '@/objects/shared/ids'
import type { Promotion } from '@/objects/shared/Promotion'
import { promotionSummary, roundMoney } from '@/lib/promotions'
import { cn } from '@/lib/utils'
import { useMerchantConsoleStore } from '@/stores/pages/use-merchant-console-store'

import { MerchantAICopywritingCard } from './MerchantAICopywritingCard'

type ProductsTabProps = {
  selectedStore: MerchantStoreProfile | null
  onCreateProduct: (input: CreateProductRequest) => Promise<Product>
  onEditProduct: (productId: ProductId, input: UpdateProductRequest) => Promise<void>
  onUploadProductImage: (productId: ProductId, file: File) => Promise<Product>
}

const listingStatuses = Object.values(ListingStatuses)

type ProductFormState = UpdateProductRequest
type CreateProductFormState = {
  name: string
  description: string
  imageUrl: string
  categoryName: string
  price: number
  remainingStock: number
  listingStatus: CreateProductRequest['listingStatus']
  bundleGroups: ProductBundleGroup[]
}

type StorePromotionDialogState = {
  mode: 'add' | 'edit'
  promotion: Promotion
  original: Promotion | null
}

const initialCreateFormState: CreateProductFormState = {
  name: '',
  description: '',
  imageUrl: '',
  categoryName: '默认分类',
  price: 0,
  remainingStock: 0,
  listingStatus: ListingStatuses.listed,
  bundleGroups: [],
}

const productCategoryName = (product: Pick<Product, 'categoryName'>) => product.categoryName?.trim() || '默认分类'
const isBundleProduct = (product: Pick<Product, 'bundleGroups'>) => (product.bundleGroups ?? []).length > 0
const bundleGroupTypes: Array<{ value: ProductBundleGroup['selectionType']; label: string }> = [
  { value: 'fixed', label: '指定菜品' },
  { value: 'repeatable', label: '可选菜品，可重复' },
  { value: 'nonRepeatable', label: '可选菜品，不可重复' },
]

const serializePromotion = (promotion: Promotion | null) => JSON.stringify(promotion)

const createBundleGroup = (): ProductBundleGroup => ({
  id: `bundle-group-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: '套餐类别',
  quantity: 1,
  selectionType: 'repeatable',
  includedPrice: 0,
  options: [],
})

const maxBundleOptionPrice = (options: ProductBundleGroup['options'], products: Product[]) => {
  const prices = options
    .map((option) => products.find((item) => item.id === option.productId)?.price)
    .filter((price): price is number => typeof price === 'number' && Number.isFinite(price))
  return prices.length > 0 ? Math.max(...prices) : 0
}

const hasCustomBundleExtraPrice = (group: ProductBundleGroup) => group.options.some((option) => option.customExtraPrice || option.extraPrice > 0)

const normalizeBundleOption = (option: ProductBundleGroup['options'][number]) => {
  const customExtraPrice = option.customExtraPrice ?? option.extraPrice > 0
  return {
    productId: option.productId,
    recommended: option.recommended ?? false,
    extraPrice: customExtraPrice ? Math.max(0, Number.isFinite(option.extraPrice) ? option.extraPrice : 0) : 0,
    customExtraPrice,
  }
}

const sanitizeBundleGroups = (groups: ProductBundleGroup[], products: Product[]) =>
  groups
    .map((group) => {
      const selectionType = group.selectionType ?? 'repeatable'
      const uniqueOptions = group.options.filter((option, index, list) => option.productId && list.findIndex((item) => item.productId === option.productId) === index)
      const normalizedOptions = uniqueOptions.map(normalizeBundleOption)
      const hasCustomExtraPrice = normalizedOptions.some((option) => option.customExtraPrice)
      const defaultIncludedPrice = maxBundleOptionPrice(normalizedOptions, products)
      const includedPrice = Number.isFinite(group.includedPrice) && group.includedPrice > 0 ? group.includedPrice : defaultIncludedPrice
      return {
        ...group,
        name: group.name.trim() || '套餐类别',
        quantity: selectionType === 'fixed' ? Math.max(1, normalizedOptions.length) : Math.max(1, Math.floor(group.quantity || 1)),
        selectionType,
        includedPrice: hasCustomExtraPrice ? 0 : Math.max(0, includedPrice),
        options: normalizedOptions,
      }
    })
    .filter((group) => group.options.length > 0)

const validateBundleGroups = (groups: ProductBundleGroup[], products: Product[]) => {
  const invalidGroup = groups.find((group) => !group.options.some((option) => {
    const product = products.find((item) => item.id === option.productId)
    return product ? bundleOptionExtraPrice(group, product) <= 0 : false
  }))
  return invalidGroup ? `${invalidGroup.name}至少需要包含一个不加价菜品，请调整包含价或加价金额。` : null
}

function productDiscountedPrice(product: Product, promotion: Promotion) {
  return roundMoney(product.price - promotion.discountValue)
}

function productDiscountRateText(originalPrice: number, currentPrice: number) {
  if (originalPrice <= 0 || currentPrice <= 0 || !Number.isFinite(currentPrice)) return '—'
  return `${(currentPrice / originalPrice * 10).toFixed(1)}折`
}

function BundleGroupsEditor({
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

export function ProductsTab({ selectedStore, onCreateProduct, onEditProduct, onUploadProductImage }: ProductsTabProps) {
  const { showNotice } = useAppChrome()
  const saveStorePromotions = useMerchantConsoleStore((state) => state.saveStorePromotions)
  const merchantProducts = useMemo(() => selectedStore?.products ?? [], [selectedStore?.products])
  const categoryGroups = useMemo(
    () =>
      merchantProducts.reduce<Array<{ categoryName: string; products: Product[] }>>((groups, product) => {
        const categoryName = productCategoryName(product)
        const matched = groups.find((group) => group.categoryName === categoryName)
        if (matched) {
          matched.products.push(product)
        } else {
          groups.push({ categoryName, products: [product] })
        }
        return groups
      }, []),
    [merchantProducts],
  )
  const productFileInputRef = useRef<HTMLInputElement>(null)
  const createProductFileInputRef = useRef<HTMLInputElement>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [discountProduct, setDiscountProduct] = useState<Product | null>(null)
  const [productPromotionDraft, setProductPromotionDraft] = useState<Promotion | null>(null)
  const [storePromotionDialog, setStorePromotionDialog] = useState<StorePromotionDialogState | null>(null)
  const [storePromotionExitPromptOpen, setStorePromotionExitPromptOpen] = useState(false)
  const [formState, setFormState] = useState<ProductFormState | null>(null)
  const [createFormState, setCreateFormState] = useState<CreateProductFormState>(initialCreateFormState)
  const [createImageFile, setCreateImageFile] = useState<File | null>(null)
  const [promotionsDraft, setPromotionsDraft] = useState<{ merchantId: string | null; promotions: Promotion[] }>({
    merchantId: null,
    promotions: [],
  })
  const [saving, setSaving] = useState(false)
  const selectedMerchantId = selectedStore?.merchant.id ?? null
  const promotions =
    promotionsDraft.merchantId === selectedMerchantId
      ? promotionsDraft.promotions
      : (selectedStore?.merchant.promotions ?? [])
  const storePromotions = promotions.filter((promotion) => promotion.discountType !== 'productAmount')

  const productPromotionFor = (productId: ProductId) =>
    promotions.find((promotion) => promotion.discountType === 'productAmount' && (promotion.productIds ?? []).includes(productId))
  const enabledProductPromotionFor = (productId: ProductId) => {
    const promotion = productPromotionFor(productId)
    return promotion?.enabled ? promotion : undefined
  }

  useEffect(() => {
    if (!editingProduct) {
      setFormState(null)
      return
    }

    setFormState({
      name: editingProduct.name,
      description: editingProduct.description,
      imageUrl: editingProduct.imageUrl,
      categoryName: productCategoryName(editingProduct),
      price: editingProduct.price,
      remainingStock: editingProduct.remainingStock,
      listingStatus: editingProduct.listingStatus,
      bundleGroups: editingProduct.bundleGroups ?? [],
    })
  }, [editingProduct])


  if (!selectedStore) {
    return (
      <Card className="border-orange-100 bg-white/95">
        <CardContent className="p-6 text-sm text-slate-600">请先选择店铺后查看菜品管理内容。</CardContent>
      </Card>
    )
  }

  const editBundleProducts = merchantProducts.filter((product) => product.id !== editingProduct?.id)
  const createIsBundle = createFormState.bundleGroups.length > 0
  const formIsBundle = (formState?.bundleGroups ?? []).length > 0
  const createSelectableProducts = merchantProducts.filter((product) => !isBundleProduct(product))
  const editSelectableProducts = editBundleProducts.filter((product) => !isBundleProduct(product))
  const createNormalizedBundleGroups = sanitizeBundleGroups(createFormState.bundleGroups, merchantProducts)
  const formNormalizedBundleGroups = sanitizeBundleGroups(formState?.bundleGroups ?? [], editBundleProducts)
  const createBundleIncomplete = createIsBundle && createNormalizedBundleGroups.length === 0
  const formBundleIncomplete = formIsBundle && formNormalizedBundleGroups.length === 0
  const createSubmitDisabled = saving || !createFormState.name.trim() || createBundleIncomplete
  const formSubmitDisabled = !formState || saving || formBundleIncomplete

  const openCreateProductDialog = () => {
    setCreateImageFile(null)
    setCreateFormState({ ...initialCreateFormState, bundleGroups: [] })
    setIsCreateDialogOpen(true)
  }

  const openCreateBundleDialog = () => {
    setCreateImageFile(null)
    setCreateFormState({ ...initialCreateFormState, categoryName: '精选套餐', bundleGroups: [createBundleGroup()] })
    setIsCreateDialogOpen(true)
  }

  const closeCreateDialog = () => {
    setCreateImageFile(null)
    setCreateFormState({ ...initialCreateFormState, bundleGroups: [] })
    setIsCreateDialogOpen(false)
  }

  const handleSave = async () => {
    if (!editingProduct || !formState) {
      return
    }

    const normalizedBundleGroups = sanitizeBundleGroups(formState.bundleGroups ?? [], editBundleProducts)
    if (formIsBundle && editSelectableProducts.length === 0) {
      showNotice('请先保留至少一个普通菜品，再把商品设置为套餐。', 'error')
      return
    }
    if (formIsBundle && normalizedBundleGroups.length === 0) {
      showNotice('请至少添加一个套餐类别，并在类别中选择已有菜品。', 'error')
      return
    }
    const bundleValidationMessage = validateBundleGroups(normalizedBundleGroups, editBundleProducts)
    if (formIsBundle && bundleValidationMessage) {
      showNotice(bundleValidationMessage, 'error')
      return
    }

    setSaving(true)
    try {
      await onEditProduct(editingProduct.id, {
        ...formState,
        description: formState.description.trim(),
        price: formState.price,
        bundleGroups: normalizedBundleGroups,
      })
      setEditingProduct(null)
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async () => {
    if (!selectedStore) {
      return
    }
    if (!createFormState.name.trim()) {
      return
    }

    const normalizedBundleGroups = sanitizeBundleGroups(createFormState.bundleGroups, merchantProducts)
    if (createIsBundle && createSelectableProducts.length === 0) {
      showNotice('请先创建普通菜品，再创建套餐。', 'error')
      return
    }
    if (createIsBundle && normalizedBundleGroups.length === 0) {
      showNotice('请至少添加一个套餐类别，并在类别中选择已有菜品。', 'error')
      return
    }
    const bundleValidationMessage = validateBundleGroups(normalizedBundleGroups, merchantProducts)
    if (createIsBundle && bundleValidationMessage) {
      showNotice(bundleValidationMessage, 'error')
      return
    }

    setSaving(true)
    try {
      const created = await onCreateProduct({
        merchantId: selectedStore.merchant.id,
        ...createFormState,
        description: createFormState.description.trim(),
        price: createFormState.price,
        bundleGroups: normalizedBundleGroups,
      })
      if (createImageFile) {
        await onUploadProductImage(created.id, createImageFile)
      }
      closeCreateDialog()
    } finally {
      setSaving(false)
    }
  }

  const handleCreateProductFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    const fileError = getLocalImageFileError(file)
    if (fileError) {
      showNotice(fileError, 'error')
      return
    }

    setCreateImageFile(file)
  }

  const handleProductFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !editingProduct) {
      return
    }

    const fileError = getLocalImageFileError(file)
    if (fileError) {
      showNotice(fileError, 'error')
      return
    }

    setSaving(true)
    try {
      const updated = await onUploadProductImage(editingProduct.id, file)
      setEditingProduct(updated)
      setFormState({
        name: updated.name,
        description: updated.description,
        imageUrl: updated.imageUrl,
        categoryName: productCategoryName(updated),
        price: updated.price,
        remainingStock: updated.remainingStock,
        listingStatus: updated.listingStatus,
        bundleGroups: updated.bundleGroups ?? [],
      })
    } finally {
      setSaving(false)
    }
  }

  const normalizePromotionPatch = (promotion: Promotion, patch: Partial<Promotion>): Promotion => {
    const next = { ...promotion, ...patch }
    const usageLimit = next.usageLimit === null || next.usageLimit === undefined ? null : Math.max(1, Math.floor(next.usageLimit))
    const triggerType = next.discountType === 'productAmount' ? 'none' : (next.triggerType === 'items' ? 'items' : 'amount')
    const defaultTriggerValue = triggerType === 'items' ? 2 : 50
    return {
      ...next,
      triggerType,
      triggerValue: triggerType === 'none' ? 0 : Math.max(1, Number(next.triggerValue) || defaultTriggerValue),
      usageLimit,
      remainingUses: usageLimit === null ? null : Math.min(next.remainingUses ?? usageLimit, usageLimit),
      productIds: next.discountType === 'productAmount' ? (next.productIds ?? []) : [],
    }
  }

  const openStorePromotionDialog = (promotion: Promotion) => {
    setStorePromotionDialog({ mode: 'edit', promotion, original: promotion })
  }

  const handleAddPromotion = () => {
    const promotion = createDefaultPromotion('merchant-promo', '新优惠')
    setStorePromotionDialog({ mode: 'add', promotion, original: null })
  }

  const updateStorePromotionDraft = (patch: Partial<Promotion>) => {
    setStorePromotionDialog((current) => current ? { ...current, promotion: normalizePromotionPatch(current.promotion, patch) } : current)
  }

  const storePromotionDirty = storePromotionDialog ? serializePromotion(storePromotionDialog.promotion) !== serializePromotion(storePromotionDialog.original) : false

  const requestCloseStorePromotionDialog = () => {
    if (storePromotionDirty) {
      setStorePromotionExitPromptOpen(true)
      return
    }
    setStorePromotionDialog(null)
  }

  const saveStorePromotionDraft = async () => {
    if (!storePromotionDialog || !selectedMerchantId) return false
    const nextPromotions = storePromotionDialog.mode === 'add'
      ? [...promotions, storePromotionDialog.promotion]
      : promotions.map((promotion) => promotion.id === storePromotionDialog.promotion.id ? storePromotionDialog.promotion : promotion)
    try {
      await saveStorePromotions(selectedMerchantId, nextPromotions)
      setPromotionsDraft({ merchantId: selectedMerchantId, promotions: nextPromotions })
      showNotice('店铺优惠已提交保存。', 'success')
      setStorePromotionDialog({ ...storePromotionDialog, original: storePromotionDialog.promotion })
      return true
    } catch (error) {
      showNotice(error instanceof Error ? error.message : '保存店铺优惠失败', 'error')
      return false
    }
  }

  const saveAndCloseStorePromotionDialog = async () => {
    const saved = await saveStorePromotionDraft()
    if (saved) {
      setStorePromotionExitPromptOpen(false)
      setStorePromotionDialog(null)
    }
  }

  const discardAndCloseStorePromotionDialog = () => {
    setStorePromotionExitPromptOpen(false)
    setStorePromotionDialog(null)
  }

  const removeStorePromotion = async (promotionId: string) => {
    if (!selectedMerchantId) return
    const nextPromotions = promotions.filter((promotion) => promotion.id !== promotionId)
    try {
      await saveStorePromotions(selectedMerchantId, nextPromotions)
      setPromotionsDraft({ merchantId: selectedMerchantId, promotions: nextPromotions })
      showNotice('店铺优惠已删除。', 'success')
      setStorePromotionDialog(null)
    } catch (error) {
      showNotice(error instanceof Error ? error.message : '删除店铺优惠失败', 'error')
    }
  }

  const handleOpenProductPromotion = (product: Product) => {
    const existing = productPromotionFor(product.id)
    const maxDiscount = Math.max(0.01, roundMoney(product.price - 0.01))
    const schedule = defaultPromotionSchedule()
    const draft = existing ?? {
      id: `product-promo-${product.id}-${Date.now()}`,
      title: `${product.name}专属优惠`,
      discountType: 'productAmount',
      discountValue: Math.min(1, maxDiscount),
      triggerType: 'none',
      triggerValue: 0,
      startsAt: schedule.startsAt,
      endsAt: schedule.endsAt,
      dailyStartTime: schedule.dailyStartTime,
      dailyEndTime: schedule.dailyEndTime,
      productIds: [product.id],
      usageLimit: null,
      remainingUses: null,
      enabled: false,
    }
    setDiscountProduct(product)
    setProductPromotionDraft(draft)
  }

  const closeProductPromotionDialog = () => {
    setDiscountProduct(null)
    setProductPromotionDraft(null)
  }

  const validateProductPromotion = (product: Product, promotion: Promotion): string | null => {
    const currentPrice = productDiscountedPrice(product, promotion)
    if (currentPrice <= 0) return '优惠后价格必须大于 0 元。'
    if (currentPrice >= product.price) return '优惠后价格必须小于原价。'
    return null
  }

  const updateProductPromotionDraft = (patch: Partial<Promotion>) => {
    if (!discountProduct || !productPromotionDraft) return
    const nextDiscountValue = patch.discountValue === undefined
      ? productPromotionDraft.discountValue
      : (Number.isFinite(patch.discountValue) ? roundMoney(patch.discountValue) : 0)
    const normalizedPromotion: Promotion = {
      ...productPromotionDraft,
      ...patch,
      title: `${discountProduct.name}专属优惠`,
      discountType: 'productAmount',
      productIds: [discountProduct.id],
      discountValue: nextDiscountValue,
      triggerType: 'none',
      triggerValue: 0,
    }
    setProductPromotionDraft(normalizedPromotion)
  }

  const handleSubmitProductPromotion = async () => {
    if (!discountProduct || !productPromotionDraft || !selectedMerchantId) return
    const validationMessage = validateProductPromotion(discountProduct, productPromotionDraft)
    if (validationMessage) {
      showNotice(validationMessage, 'error')
      return
    }

    const nextPromotions = [
      ...promotions.filter((promotion) => !(promotion.discountType === 'productAmount' && (promotion.productIds ?? []).includes(discountProduct.id)) && promotion.id !== productPromotionDraft.id),
      productPromotionDraft,
    ]
    try {
      await saveStorePromotions(selectedMerchantId, nextPromotions)
      setPromotionsDraft({ merchantId: selectedMerchantId, promotions: nextPromotions })
      showNotice('菜品优惠已提交保存。', 'success')
      closeProductPromotionDialog()
    } catch (error) {
      showNotice(error instanceof Error ? error.message : '保存菜品优惠失败', 'error')
    }
  }

  const handleRemoveProductPromotion = async () => {
    if (!discountProduct || !selectedMerchantId) return
    const nextPromotions = promotions.filter((promotion) => !(promotion.discountType === 'productAmount' && (promotion.productIds ?? []).includes(discountProduct.id)))
    try {
      await saveStorePromotions(selectedMerchantId, nextPromotions)
      setPromotionsDraft({ merchantId: selectedMerchantId, promotions: nextPromotions })
      showNotice('菜品优惠已删除。', 'success')
      closeProductPromotionDialog()
    } catch (error) {
      showNotice(error instanceof Error ? error.message : '删除菜品优惠失败', 'error')
    }
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>店铺名称</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Store className="size-4 text-orange-500" />
              {selectedStore.merchant.storeName}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>主营商品数</CardDescription>
            <CardTitle>{merchantProducts.length}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <MerchantAICopywritingCard selectedStore={selectedStore} />

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PackageSearch className="size-5 text-orange-500" />
                商品管理
              </CardTitle>
              <CardDescription>可新建菜品和套餐，或通过编辑统一修改商品名称、描述、库存、上/下架状态和价格</CardDescription>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button onClick={openCreateProductDialog}>新建菜品</Button>
              <Button variant="secondary" onClick={openCreateBundleDialog}>新建套餐</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {merchantProducts.length === 0 ? (
            <p className="text-sm text-slate-500">当前店铺暂无商品，请先创建菜品。</p>
          ) : (
            categoryGroups.map((group) => (
              <section key={group.categoryName} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-slate-950">{group.categoryName}</h3>
                  <span className="text-xs text-slate-500">{group.products.length} 个菜品</span>
                  <span className="h-px flex-1 bg-orange-100" />
                </div>
                <div className="space-y-3">
                  {group.products.map((product) => (
                    (() => {
                      const productPromotion = enabledProductPromotionFor(product.id)
                      const discountedPrice = productPromotion ? productDiscountedPrice(product, productPromotion) : null
                      const bundleProduct = isBundleProduct(product)
                      return (
                        <div
                          key={product.id}
                          className="rounded-xl border border-orange-100 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            {product.imageUrl?.trim() ? (
                              <div className="aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl border border-orange-100 bg-orange-50">
                                <img
                                  src={resolveApiMediaUrl(product.imageUrl)}
                                  alt={product.name}
                                  className="size-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex aspect-[4/3] w-28 shrink-0 items-center justify-center rounded-xl border border-dashed border-orange-100 bg-orange-50 text-orange-400">
                                <ImageIcon className="size-5" />
                              </div>
                            )}
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-medium text-slate-900">{product.name}</p>
                                  {bundleProduct ? <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">套餐</Badge> : null}
                                  {productPromotion ? <Badge variant="secondary">优惠后 ¥{discountedPrice?.toFixed(2)}</Badge> : null}
                                </div>
                                <p className="text-sm text-slate-600">{product.description}</p>
                                {bundleProduct ? (
                                  <p className="text-xs text-amber-700">
                                    {(product.bundleGroups ?? []).map((group) => `${group.name}选${group.quantity}`).join(' · ')}
                                  </p>
                                ) : null}
                              </div>
                                <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                                <p>{bundleProduct ? '套餐基础价' : '价格'}：¥{product.price.toFixed(2)} / 份</p>
                                <p>金额：¥{product.price.toFixed(2)}</p>
                                <p>剩余库存：{product.remainingStock}</p>
                                <p>月销量：{product.monthlySales}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant="outline">{product.listingStatus}</Badge>
                              <Button size="sm" variant="outline" onClick={() => handleOpenProductPromotion(product)}>
                                优惠
                              </Button>
                              <Button size="sm" onClick={() => setEditingProduct(product)}>
                                编辑
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })()
                  ))}
                </div>
              </section>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TicketPercent className="size-5 text-orange-500" />
              店铺优惠
            </CardTitle>
            <CardDescription>首页仅展示只读优惠信息；进入管理后可编辑并提交保存。</CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={handleAddPromotion}>
            <Plus className="size-4" />
            新增优惠
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {storePromotions.length === 0 ? <p className="text-sm text-slate-500">当前未设置店铺优惠。</p> : null}
          {storePromotions.map((promotion) => {
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
                <Button type="button" size="sm" variant="outline" className="shrink-0" onClick={() => openStorePromotionDialog(promotion)}>
                  管理优惠
                </Button>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Dialog open={Boolean(storePromotionDialog)} onOpenChange={(open) => !open && requestCloseStorePromotionDialog()}>
        <DialogContent showCloseButton={false} className="flex max-h-[min(42rem,calc(100vh-2rem))] max-w-4xl flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white p-0">
          <DialogHeader className="shrink-0 border-b border-orange-100 px-6 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <Button type="button" variant="outline" size="sm" onClick={requestCloseStorePromotionDialog}>
                  <ArrowLeft className="size-4" />
                  返回
                </Button>
                <div>
                  <DialogTitle>{storePromotionDialog?.mode === 'add' ? '添加店铺优惠' : '管理店铺优惠'}</DialogTitle>
                  <DialogDescription>修改优惠内容或启停状态后，点击右上角提交才会保存。</DialogDescription>
                </div>
              </div>
              <Button type="button" onClick={() => void saveStorePromotionDraft()} disabled={!storePromotionDirty}>
                <Save className="size-4" />
                提交
              </Button>
            </div>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            {storePromotionDialog ? (
              <PromotionEditorCard
                promotion={storePromotionDialog.promotion}
                onChange={(_, patch) => updateStorePromotionDraft(patch)}
                onRemove={(id) => void removeStorePromotion(id)}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={storePromotionExitPromptOpen} onOpenChange={setStorePromotionExitPromptOpen}>
        <AlertDialogContent>
          <AlertDialogCancel className="mb-1 w-fit border-0 px-0 text-slate-500 shadow-none hover:bg-transparent" onClick={() => setStorePromotionExitPromptOpen(false)}>
            <ArrowLeft className="size-4" />
            返回优惠管理
          </AlertDialogCancel>
          <AlertDialogHeader>
            <AlertDialogTitle>有未提交的优惠修改</AlertDialogTitle>
            <AlertDialogDescription>离开前请确认是否保存。本次修改只有点击“提交”后才会生效。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-slate-700 hover:bg-slate-800" onClick={discardAndCloseStorePromotionDialog}>
              不保存并退出
            </AlertDialogAction>
            <AlertDialogAction onClick={() => void saveAndCloseStorePromotionDialog()}>
              保存并退出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={Boolean(discountProduct)} onOpenChange={(open) => !open && closeProductPromotionDialog()}>
        <DialogContent className="flex max-h-[min(36rem,calc(100vh-2rem))] w-[calc(100vw-2rem)] max-w-2xl flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white p-0">
          <DialogHeader className="shrink-0 px-6 pt-6">
            <DialogTitle>{discountProduct ? `${discountProduct.name}优惠` : '菜品优惠'}</DialogTitle>
            <DialogDescription>为当前菜品输入优惠后的现在金额，提交时会校验必须小于原价。</DialogDescription>
          </DialogHeader>
          {discountProduct && productPromotionDraft ? (
            (() => {
              const finite = productPromotionDraft.usageLimit !== null && productPromotionDraft.usageLimit !== undefined
              const currentPrice = productDiscountedPrice(discountProduct, productPromotionDraft)
              const discountRate = productDiscountRateText(discountProduct.price, currentPrice)
              const validationMessage = validateProductPromotion(discountProduct, productPromotionDraft)
              return (
                <div
                  className={cn(
                    'min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-4 transition-colors',
                    !productPromotionDraft.enabled && 'bg-slate-50 text-slate-500',
                  )}
                >
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_8rem_8rem_8rem]">
                    <div className="space-y-1">
                      <Label>当前菜品</Label>
                      <Input value={discountProduct.name} disabled />
                    </div>
                    <div className="space-y-1">
                      <Label>原价</Label>
                      <Input value={`¥${discountProduct.price.toFixed(2)}`} disabled />
                    </div>
                    <div className="space-y-1">
                      <Label>现在金额</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={Number.isFinite(currentPrice) ? currentPrice : ''}
                        onChange={(event) => {
                          const nextPrice = Number(event.target.value)
                          updateProductPromotionDraft({ discountValue: roundMoney(discountProduct.price - (Number.isFinite(nextPrice) ? nextPrice : 0)) })
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>当前折扣</Label>
                      <Input value={discountRate} disabled />
                    </div>
                  </div>
                  {validationMessage ? <p className="text-xs text-rose-600">{validationMessage}</p> : null}

                  <div className="grid gap-3 md:grid-cols-2 md:items-end">
                    <div className="space-y-1">
                      <Label>开始日期</Label>
                      <PromotionDateInput value={productPromotionDraft.startsAt} onChange={(value) => updateProductPromotionDraft({ startsAt: value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>结束日期</Label>
                      <PromotionDateInput value={productPromotionDraft.endsAt} onChange={(value) => updateProductPromotionDraft({ endsAt: value })} />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_9rem_8rem] md:items-end">
                    <div className="space-y-1">
                      <Label>每日开始时刻</Label>
                      <Input type="time" value={productPromotionDraft.dailyStartTime ?? ''} onChange={(event) => updateProductPromotionDraft({ dailyStartTime: event.target.value || null })} />
                    </div>
                    <div className="space-y-1">
                      <Label>每日结束时刻</Label>
                      <Input type="time" value={productPromotionDraft.dailyEndTime ?? ''} onChange={(event) => updateProductPromotionDraft({ dailyEndTime: event.target.value || null })} />
                    </div>
                    <div className="space-y-1">
                      <Label>次数</Label>
                      <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={finite ? 'finite' : 'infinite'} onChange={(event) => updateProductPromotionDraft({ usageLimit: event.target.value === 'finite' ? (productPromotionDraft.usageLimit ?? 10) : null, remainingUses: event.target.value === 'finite' ? (productPromotionDraft.remainingUses ?? productPromotionDraft.usageLimit ?? 10) : null })}>
                        <option value="infinite">无限次</option>
                        <option value="finite">有限次数</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label>可用次数</Label>
                      <Input type="number" min="1" step="1" value={productPromotionDraft.usageLimit ?? ''} disabled={!finite} onChange={(event) => updateProductPromotionDraft({ usageLimit: Number(event.target.value) || 1, remainingUses: Number(event.target.value) || 1 })} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <p className={cn('min-w-0 break-words text-xs', productPromotionDraft.enabled ? 'text-orange-700' : 'text-slate-500')}>
                      {productPromotionDraft.enabled
                        ? `预览：${discountProduct.name} 原价 ¥${discountProduct.price.toFixed(2)}，现在 ¥${currentPrice.toFixed(2)}，${discountRate} · ${finite ? `${productPromotionDraft.remainingUses ?? productPromotionDraft.usageLimit}张优惠券` : '优惠'}`
                        : '已停用：商家端菜品卡片、顾客端和结算中不会显示或使用该优惠'}
                    </p>
                    <PromotionEnableControl enabled={productPromotionDraft.enabled} onChange={(enabled) => updateProductPromotionDraft({ enabled })} />
                  </div>
                </div>
              )
            })()
          ) : null}
          <DialogFooter className="shrink-0 flex-wrap gap-2 border-t border-orange-100 px-6 py-4">
            {discountProduct && productPromotionFor(discountProduct.id) ? (
              <Button type="button" variant="outline" className="text-rose-600" onClick={handleRemoveProductPromotion}>
                删除优惠
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={closeProductPromotionDialog}>取消</Button>
            <Button type="button" onClick={() => void handleSubmitProductPromotion()}>提交优惠</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => (open ? setIsCreateDialogOpen(true) : closeCreateDialog())}>
        <DialogContent className="flex max-h-[min(42rem,calc(100vh-2rem))] max-w-2xl flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white p-0">
          <DialogHeader className="shrink-0 px-6 pt-6">
            <DialogTitle>{createIsBundle ? '新建套餐' : '新建商品'}</DialogTitle>
            <DialogDescription>
              {createIsBundle ? '选择当前店铺已有普通菜品组成套餐，并设置套餐基础价。' : '创建普通菜品后，可继续用它组成套餐。'}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <input
              ref={createProductFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
              className="sr-only"
              onChange={handleCreateProductFileChange}
            />
            {createFormState.imageUrl.trim() ? (
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-orange-100 bg-orange-50">
                <img
                  src={resolveApiMediaUrl(createFormState.imageUrl)}
                  alt="菜品预览"
                  className="size-full object-cover"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="create-product-name">{createIsBundle ? '套餐名称' : '商品名称'}</Label>
              <Input
                id="create-product-name"
                placeholder={createIsBundle ? '例如：双人精选套餐' : '例如：招牌牛肉饭'}
                value={createFormState.name}
                onChange={(event) => setCreateFormState({ ...createFormState, name: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-product-image-url">{createIsBundle ? '套餐图片' : '菜品图片'}</Label>
              <Input
                id="create-product-image-url"
                type="text"
                inputMode="url"
                placeholder="可粘贴 https://example.com/product.jpg，或选择本地图片"
                value={createFormState.imageUrl}
                onChange={(event) => setCreateFormState({ ...createFormState, imageUrl: event.target.value })}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={saving}
                  onClick={() => createProductFileInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  {createIsBundle ? '上传本地套餐图' : '上传本地菜品图'}
                </Button>
                {createImageFile ? (
                  <span className="text-xs text-slate-500">已选择：{createImageFile.name}，创建后自动上传。</span>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-product-category">商品类别</Label>
              <Input
                id="create-product-category"
                value={createFormState.categoryName}
                placeholder="例如：人气Top、精选套餐、饮品"
                onChange={(event) => setCreateFormState({ ...createFormState, categoryName: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-product-description">描述信息</Label>
              <Textarea
                id="create-product-description"
                value={createFormState.description}
                onChange={(event) => setCreateFormState({ ...createFormState, description: event.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="create-product-price">{createIsBundle ? '套餐自定义价格' : '价格'}</Label>
                <Input
                  id="create-product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={createFormState.price === 0 ? '' : createFormState.price}
                  onChange={(event) => {
                    const price = Number(event.target.value) || 0
                    setCreateFormState((current) => ({ ...current, price }))
                  }}
                />
                {createIsBundle ? <p className="text-xs text-slate-500">顾客支付套餐价，加上各类别中超出包含价的菜品加价。</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-product-stock">剩余库存</Label>
                <Input
                  id="create-product-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={createFormState.remainingStock === 0 ? '' : createFormState.remainingStock}
                  onChange={(event) =>
                    setCreateFormState({ ...createFormState, remainingStock: Number(event.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>上/下架状态</Label>
              <Select
                value={createFormState.listingStatus}
                onValueChange={(value: ListingStatus) => setCreateFormState({ ...createFormState, listingStatus: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择状态" />
                </SelectTrigger>
                <SelectContent>
                  {listingStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-orange-100 bg-orange-50/60 px-3 py-2 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  className="size-4 accent-orange-500"
                  checked={createFormState.bundleGroups.length > 0}
                  onChange={(event) => setCreateFormState({ ...createFormState, bundleGroups: event.target.checked ? [createBundleGroup()] : [] })}
                />
                这是一个套餐商品
              </label>
              {createIsBundle && createSelectableProducts.length === 0 ? (
                <p className="rounded-xl border border-dashed border-orange-200 bg-white/70 px-3 py-3 text-sm text-orange-700">
                  请先创建至少一个普通菜品，再回来选择已有菜品组成套餐。
                </p>
              ) : null}
              {createIsBundle && createSelectableProducts.length > 0 && createBundleIncomplete ? (
                <p className="rounded-xl border border-dashed border-orange-200 bg-white/70 px-3 py-3 text-sm text-orange-700">
                  请至少保留一个套餐类别，并在类别中选择已有普通菜品。
                </p>
              ) : null}
              {createFormState.bundleGroups.length > 0 ? (
                <BundleGroupsEditor
                  groups={createFormState.bundleGroups}
                  products={merchantProducts}
                  onChange={(bundleGroups) => setCreateFormState((current) => ({ ...current, bundleGroups }))}
                />
              ) : null}
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-orange-100 px-6 py-4">
            <Button
              variant="outline"
              onClick={closeCreateDialog}
              disabled={saving}
            >
              取消
            </Button>
            <Button
              onClick={() => void handleCreate()}
              disabled={createSubmitDisabled}
            >
              {createIsBundle ? '创建套餐' : '创建商品'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="flex max-h-[min(42rem,calc(100vh-2rem))] max-w-2xl flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white p-0">
          <DialogHeader className="shrink-0 px-6 pt-6">
            <DialogTitle>编辑商品</DialogTitle>
            <DialogDescription>可修改普通菜品信息，也可把商品设置为套餐并配置可选类别。</DialogDescription>
          </DialogHeader>

          {formState ? (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
              <input
                ref={productFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
                className="sr-only"
                onChange={(event) => void handleProductFileChange(event)}
              />
              {formState.imageUrl.trim() ? (
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-orange-100 bg-orange-50">
                  <img
                    src={resolveApiMediaUrl(formState.imageUrl)}
                    alt={formState.name || '菜品预览'}
                    className="size-full object-cover"
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="product-name">商品名称</Label>
                <Input
                  id="product-name"
                  value={formState.name}
                  onChange={(event) => setFormState({ ...formState, name: event.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-image-url">商品图片链接</Label>
                <Input
                  id="product-image-url"
                  type="text"
                  inputMode="url"
                  placeholder="https://example.com/product.jpg"
                  value={formState.imageUrl}
                  onChange={(event) => setFormState({ ...formState, imageUrl: event.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-category">商品类别</Label>
                <Input
                  id="product-category"
                  value={formState.categoryName}
                  placeholder="例如：人气Top、精选套餐、饮品"
                  onChange={(event) => setFormState({ ...formState, categoryName: event.target.value })}
                />
              </div>

              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() => productFileInputRef.current?.click()}
              >
                <Upload className="size-4" />
                从本地上传商品图
              </Button>

              <div className="space-y-2">
                <Label htmlFor="product-description">描述信息</Label>
                <Textarea
                  id="product-description"
                  value={formState.description}
                  onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-price">{formIsBundle ? '套餐自定义价格' : '价格'}</Label>
                  <Input
                    id="product-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.price === 0 ? '' : formState.price}
                    onChange={(event) => {
                      const price = Number(event.target.value) || 0
                      setFormState((current) => current ? { ...current, price } : current)
                    }}
                  />
                  {formIsBundle ? <p className="text-xs text-slate-500">顾客支付套餐价，加上各类别中超出包含价的菜品加价。</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-stock">剩余库存</Label>
                  <Input
                    id="product-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formState.remainingStock === 0 ? '' : formState.remainingStock}
                    onChange={(event) =>
                      setFormState({ ...formState, remainingStock: Number(event.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>上/下架状态</Label>
                <Select
                  value={formState.listingStatus}
                  onValueChange={(value: ListingStatus) => setFormState({ ...formState, listingStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    {listingStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-orange-100 bg-orange-50/60 px-3 py-2 text-sm font-medium text-slate-800">
                  <input
                    type="checkbox"
                    className="size-4 accent-orange-500"
                    checked={(formState.bundleGroups ?? []).length > 0}
                    onChange={(event) => setFormState((current) => current ? { ...current, bundleGroups: event.target.checked ? [createBundleGroup()] : [] } : current)}
                  />
                  这是一个套餐商品
                </label>
                {formIsBundle && editSelectableProducts.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-orange-200 bg-white/70 px-3 py-3 text-sm text-orange-700">
                    请先保留至少一个普通菜品，再把商品设置为套餐。
                  </p>
                ) : null}
                {formIsBundle && editSelectableProducts.length > 0 && formBundleIncomplete ? (
                  <p className="rounded-xl border border-dashed border-orange-200 bg-white/70 px-3 py-3 text-sm text-orange-700">
                    请至少保留一个套餐类别，并在类别中选择已有普通菜品。
                  </p>
                ) : null}
                {(formState.bundleGroups ?? []).length > 0 ? (
                  <BundleGroupsEditor
                    groups={formState.bundleGroups ?? []}
                    products={editBundleProducts}
                    onChange={(bundleGroups) => setFormState((current) => current ? { ...current, bundleGroups } : current)}
                  />
                ) : null}
              </div>
            </div>
          ) : null}

          <DialogFooter className="shrink-0 border-t border-orange-100 px-6 py-4">
            <Button variant="outline" onClick={() => setEditingProduct(null)} disabled={saving}>
              取消
            </Button>
            <Button onClick={() => void handleSave()} disabled={formSubmitDisabled}>
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
