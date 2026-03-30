import { ChartNoAxesCombined, ChevronDown, ChevronUp, PackageSearch, Plus, Store, Trash2, Workflow } from 'lucide-react'
import { useMemo, useState } from 'react'

import { DeliveryPageShell } from '@/components/DeliveryPageShell'
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type { Merchant, Product, ProductShelfStatus } from '@/domain-types'
import type { MerchantStoreProfile } from '@/lib/account-store'
import { getAuthSession } from '@/lib/auth-session'
import { getMerchantAccountByUsername, updateMerchantAccountProfile } from '@/lib/account-store'
import { useMockSystem } from '@/hooks/useMockSystem'

type MerchantTab = 'products' | 'orders' | 'profile'
type ProductEditResult = 'success' | 'failure'
type ProductDialogMode = 'create' | 'edit'

function isMerchantTab(value: string): value is MerchantTab {
  return value === 'products' || value === 'orders' || value === 'profile'
}

function deriveInventoryStatus(inventoryCount: number): Product['inventoryStatus'] {
  if (inventoryCount <= 0) {
    return '售罄'
  }
  if (inventoryCount <= 10) {
    return '紧张'
  }
  return '充足'
}

function buildLocalStoreId(username: string, storeCount: number) {
  return `m-local-${username}-${storeCount + 1}`
}

function buildLocalProductId(merchantId: string, productCount: number) {
  return `p-local-${merchantId}-${productCount + 1}`
}

export default function MerchantConsole() {
  const { showNotice } = useMockSystem()
  const session = getAuthSession()
  const merchantAccount = session ? getMerchantAccountByUsername(session.account) : null
  const [activeTab, setActiveTab] = useState<MerchantTab>('products')
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(true)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [isPendingOrdersExpanded, setIsPendingOrdersExpanded] = useState(false)
  const [isHistoryOrdersExpanded, setIsHistoryOrdersExpanded] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')
  const [newStoreAddress, setNewStoreAddress] = useState('')
  const [stores, setStores] = useState<MerchantStoreProfile[]>(merchantAccount?.profile.stores ?? [])
  const [productDialogMode, setProductDialogMode] = useState<ProductDialogMode>('edit')
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productNameInput, setProductNameInput] = useState('')
  const [priceInput, setPriceInput] = useState('')
  const [inventoryInput, setInventoryInput] = useState('0')
  const [descriptionInput, setDescriptionInput] = useState('')
  const [shelfStatusInput, setShelfStatusInput] = useState<ProductShelfStatus>('上架')
  const [editResult, setEditResult] = useState<ProductEditResult>('success')
  const [pendingDeleteProductId, setPendingDeleteProductId] = useState<string | null>(null)

  const selectedStore = useMemo(
    () => stores.find((item) => item.merchant.id === selectedStoreId) ?? null,
    [stores, selectedStoreId],
  )

  const merchantProducts = selectedStore?.products ?? []
  const merchantPendingOrders = selectedStore?.pendingOrders ?? []
  const merchantHistoryOrders = selectedStore?.historyOrders ?? []
  const editingProduct = merchantProducts.find((product) => product.id === editingProductId) ?? null
  const pendingDeleteProduct = merchantProducts.find((product) => product.id === pendingDeleteProductId) ?? null

  if (!merchantAccount) {
    return (
      <DeliveryPageShell
        title="商家端后台核心功能"
        description="当前账号未绑定商家信息，请先完成商家注册资料。"
        roleBadge="商家后台"
      >
        <Card className="border-orange-100 bg-white/95">
          <CardContent className="p-6 text-sm text-slate-600">未找到当前商家账号档案。</CardContent>
        </Card>
      </DeliveryPageShell>
    )
  }

  const updateStores = (nextStores: MerchantStoreProfile[]) => {
    setStores(nextStores)
    updateMerchantAccountProfile(merchantAccount.username, (profile) => ({
      ...profile,
      stores: nextStores,
    }))
  }

  const handleCreateStore = () => {
    const trimmedName = newStoreName.trim()
    const trimmedAddress = newStoreAddress.trim()
    if (!trimmedName || !trimmedAddress) {
      return
    }

    const nextStoreId = buildLocalStoreId(merchantAccount.username, stores.length)
    const createdMerchant: Merchant = {
      id: nextStoreId,
      storeName: trimmedName,
      category: '中餐',
      address: trimmedAddress,
      phone: merchantAccount.profile.phone || '',
      rating: 5,
      tags: ['新店'],
      featuredProductIds: [],
    }

    const createdStore: MerchantStoreProfile = {
      merchant: createdMerchant,
      products: [],
      pendingOrders: [],
      historyOrders: [],
    }

    const nextStores = [...stores, createdStore]
    updateStores(nextStores)
    setSelectedStoreId(createdMerchant.id)
    setNewStoreName('')
    setNewStoreAddress('')
    setIsStoreDialogOpen(false)
    setActiveTab('products')
  }

  const openCreateProductDialog = () => {
    setProductDialogMode('create')
    setEditingProductId(null)
    setProductNameInput('')
    setPriceInput('')
    setInventoryInput('0')
    setDescriptionInput('')
    setShelfStatusInput('上架')
    setEditResult('success')
    setIsProductDialogOpen(true)
  }

  const openProductEditor = (product: Product) => {
    setProductDialogMode('edit')
    setEditingProductId(product.id)
    setProductNameInput(product.name)
    setPriceInput(product.price.toFixed(2))
    setInventoryInput(product.inventoryCount.toString())
    setDescriptionInput(product.description)
    setShelfStatusInput(product.shelfStatus)
    setEditResult('success')
    setIsProductDialogOpen(true)
  }

  const handleProductUpdate = () => {
    if (!selectedStore) {
      return
    }

    const trimmedProductName = productNameInput.trim()
    const nextPrice = Number.parseFloat(priceInput)
    const nextInventoryCount = Number.parseInt(inventoryInput || '0', 10)

    if (!trimmedProductName) {
      showNotice('商品名称不能为空。', 'error')
      return
    }

    if (!Number.isFinite(nextPrice) || nextPrice < 0) {
      showNotice('请输入有效的商品价格。', 'error')
      return
    }

    if (!Number.isInteger(nextInventoryCount) || nextInventoryCount < 0) {
      showNotice('库存量需为大于等于 0 的整数。', 'error')
      return
    }

    if (!descriptionInput.trim()) {
      showNotice('商品描述不能为空。', 'error')
      return
    }

    if (editResult === 'failure') {
      setIsProductDialogOpen(false)
      showNotice('商品修改失败，请稍后重试。', 'error')
      return
    }

    const nextStores = stores.map((storeItem) => {
      if (storeItem.merchant.id !== selectedStore.merchant.id) {
        return storeItem
      }

      const nextProductId = buildLocalProductId(selectedStore.merchant.id, storeItem.products.length)
      return {
        ...storeItem,
        products:
          productDialogMode === 'create'
            ? [
                {
                  id: nextProductId,
                  merchantId: selectedStore.merchant.id,
                  name: trimmedProductName,
                  price: Number(nextPrice.toFixed(2)),
                  description: descriptionInput.trim(),
                  imageUrl: 'https://picsum.photos/200/120?merchant-product',
                  monthlySales: 0,
                  inventoryCount: nextInventoryCount,
                  inventoryStatus: deriveInventoryStatus(nextInventoryCount),
                  shelfStatus: shelfStatusInput,
                },
                ...storeItem.products,
              ]
            : storeItem.products.map((product) =>
                product.id === editingProduct?.id
                  ? {
                      ...product,
                      name: trimmedProductName,
                      price: Number(nextPrice.toFixed(2)),
                      description: descriptionInput.trim(),
                      inventoryCount: nextInventoryCount,
                      inventoryStatus: deriveInventoryStatus(nextInventoryCount),
                      shelfStatus: shelfStatusInput,
                    }
                  : product,
              ),
      }
    })

    updateStores(nextStores)
    setIsProductDialogOpen(false)
    setEditingProductId(null)
    showNotice(productDialogMode === 'create' ? '菜品已创建。' : '商品已更新。', 'success')
  }

  const openDeleteDialog = (productId: string) => {
    setPendingDeleteProductId(productId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteProduct = () => {
    if (!selectedStore || !pendingDeleteProduct) {
      return
    }

    const nextStores = stores.map((storeItem) => {
      if (storeItem.merchant.id !== selectedStore.merchant.id) {
        return storeItem
      }

      return {
        ...storeItem,
        products: storeItem.products.filter((product) => product.id !== pendingDeleteProduct.id),
      }
    })

    updateStores(nextStores)
    setIsDeleteDialogOpen(false)
    setPendingDeleteProductId(null)
    showNotice('菜品已删除。', 'success')
  }

  const handleCompleteOrder = (orderId: string) => {
    if (!selectedStore) {
      return
    }

    const completedOrder = merchantPendingOrders.find((order) => order.id === orderId)
    if (!completedOrder) {
      return
    }

    const insufficientItem = completedOrder.items.find((item) => {
      const matchedProduct = merchantProducts.find((product) => product.id === item.productId)
      return !matchedProduct || matchedProduct.inventoryCount < item.quantity || matchedProduct.inventoryCount <= 0
    })
    if (insufficientItem) {
      showNotice(`菜品「${insufficientItem.name}」库存不足，无法完成出餐。`, 'error')
      return
    }

    const nextStores = stores.map((storeItem) => {
      if (storeItem.merchant.id !== selectedStore.merchant.id) {
        return storeItem
      }

      return {
        ...storeItem,
        pendingOrders: storeItem.pendingOrders.filter((order) => order.id !== orderId),
        historyOrders: [{ ...completedOrder, status: '已完成' }, ...storeItem.historyOrders],
        products: storeItem.products.map((product) => {
          const matchedItem = completedOrder.items.find((item) => item.productId === product.id)
          if (!matchedItem) {
            return product
          }

          const nextInventoryCount = Math.max(0, product.inventoryCount - matchedItem.quantity)
          return {
            ...product,
            inventoryCount: nextInventoryCount,
            inventoryStatus: deriveInventoryStatus(nextInventoryCount),
            monthlySales: product.monthlySales + matchedItem.quantity,
          }
        }),
      }
    })

    updateStores(nextStores)
    setExpandedOrderId((current) => (current === orderId ? null : current))
    showNotice('订单已完成出餐。', 'success')
  }

  return (
    <DeliveryPageShell
      title="商家端后台核心功能"
      description="包含商家入驻申请、商品管理、订单处理（接单/出餐完成）和营业概况查看。"
      roleBadge="商家后台"
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (isMerchantTab(value)) {
            setActiveTab(value)
          }
        }}
      >
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardContent className="px-4 py-4">
            <TabsList className="grid h-11 w-full grid-cols-3 rounded-xl bg-orange-50 p-1">
              <TabsTrigger value="products" className="rounded-lg">
                菜品
              </TabsTrigger>
              <TabsTrigger value="orders" className="rounded-lg">
                接单与出餐处理
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-lg">
                我的
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        <TabsContent value="products" className="space-y-4">
          {selectedStore ? (
            <>
              <section className="grid gap-4 md:grid-cols-3">
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
                    <CardDescription>店铺评分</CardDescription>
                    <CardTitle>{selectedStore.merchant.rating.toFixed(1)} / 5.0</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-orange-100 bg-white/95 py-0">
                  <CardHeader className="pb-2">
                    <CardDescription>主营商品数</CardDescription>
                    <CardTitle>{merchantProducts.length}</CardTitle>
                  </CardHeader>
                </Card>
              </section>

              <Card className="border-orange-100 bg-white/95">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <PackageSearch className="size-5 text-orange-500" />
                        商品管理（编辑商品信息与上架状态）
                      </CardTitle>
                      <CardDescription>商家可实时更新商品价格、库存量、描述和上架状态</CardDescription>
                    </div>
                    <Button size="sm" onClick={openCreateProductDialog}>
                      <Plus className="size-4" />
                      添加菜品
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {merchantProducts.length === 0 ? (
                    <p className="text-sm text-slate-500">当前店铺暂无商品，请先创建菜品。</p>
                  ) : (
                    merchantProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${
                          product.shelfStatus === '下架'
                            ? 'border-slate-200 bg-slate-100'
                            : 'border-orange-100 bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-slate-900">{product.name}</p>
                            <Badge
                              variant="outline"
                              className={product.shelfStatus === '下架' ? 'border-slate-300 text-slate-500' : ''}
                            >
                              {product.shelfStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">
                            ¥{product.price.toFixed(2)} · 月销量 {product.monthlySales}
                          </p>
                          <p className="text-sm text-slate-500">{product.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={product.shelfStatus === '下架' ? 'bg-slate-200 text-slate-600' : ''}
                          >
                            库存量 {product.inventoryCount}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openProductEditor(product)}
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => openDeleteDialog(product.id)}
                          >
                            <Trash2 className="size-4" />
                            删除
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-orange-100 bg-white/95">
              <CardContent className="p-6 text-sm text-slate-600">请先选择店铺后查看菜品管理内容。</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {selectedStore ? (
            <Card className="border-orange-100 bg-white/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="size-5 text-orange-500" />
                  出餐处理
                </CardTitle>
                <CardDescription>点击订单查看菜品明细，并在完成出餐后同步更新库存和销量</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {merchantPendingOrders.length === 0 ? (
                  <p className="text-sm text-slate-500">当前店铺暂无待处理订单。</p>
                ) : (
                  merchantPendingOrders.map((order) => (
                    <div key={order.id} className="rounded-xl border border-orange-100 p-4">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 text-left"
                        onClick={() => setExpandedOrderId((current) => (current === order.id ? null : order.id))}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">订单 {order.id}</p>
                            <Badge variant="outline">{order.status}</Badge>
                          </div>
                          <p className="text-sm text-slate-600">总金额 {order.totalAmount} 元</p>
                        </div>
                        {expandedOrderId === order.id ? (
                          <ChevronUp className="size-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="size-4 text-slate-500" />
                        )}
                      </button>

                      {expandedOrderId === order.id ? (
                        <div className="mt-3 space-y-3 border-t border-orange-100 pt-3">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-900">订单菜品</p>
                            {order.items.map((item) => (
                              <div
                                key={`${order.id}-${item.productId}`}
                                className="flex items-center justify-between rounded-xl bg-orange-50/60 px-3 py-2 text-sm"
                              >
                                <span className="text-slate-700">{item.name}</span>
                                <span className="text-slate-500">
                                  x{item.quantity} · ¥{item.unitPrice.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-end">
                            <Button size="sm" onClick={() => handleCompleteOrder(order.id)}>
                              出餐完成
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-orange-100 bg-white/95">
              <CardContent className="p-6 text-sm text-slate-600">请先选择店铺后查看接单与出餐处理内容。</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card className="border-orange-100 bg-white/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartNoAxesCombined className="size-5 text-orange-500" />
                营业概况
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              {selectedStore ? (
                <>
                  <div className="flex items-center justify-between rounded-xl border border-orange-100 p-3">
                    <span>当前店铺</span>
                    <span>{selectedStore.merchant.storeName}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-orange-100 p-3">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 text-left"
                      onClick={() => setIsPendingOrdersExpanded((current) => !current)}
                    >
                      <span>待处理订单</span>
                      <span className="flex items-center gap-2">
                        {merchantPendingOrders.length}
                        {isPendingOrdersExpanded ? (
                          <ChevronUp className="size-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="size-4 text-slate-500" />
                        )}
                      </span>
                    </button>
                  </div>
                  {isPendingOrdersExpanded ? (
                    <div className="space-y-2 rounded-xl border border-orange-100 p-3">
                      {merchantPendingOrders.length === 0 ? (
                        <p className="text-sm text-slate-500">暂无待处理订单。</p>
                      ) : (
                        merchantPendingOrders.map((order) => (
                          <div key={`pending-${order.id}`} className="rounded-xl bg-orange-50/60 p-3">
                            <p className="font-medium text-slate-900">订单号：{order.id}</p>
                            <p className="mt-1 text-sm text-slate-600">总金额：{order.totalAmount} 元</p>
                            <p className="mt-1 text-sm text-slate-600">下单时间：{order.placedAt}</p>
                            <p className="mt-1 text-sm text-slate-600">订单菜品：{order.items.map((item) => `${item.name} x${item.quantity}`).join('、')}</p>
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between rounded-xl border border-orange-100 p-3">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 text-left"
                      onClick={() => setIsHistoryOrdersExpanded((current) => !current)}
                    >
                      <span>历史订单</span>
                      <span className="flex items-center gap-2">
                        {merchantHistoryOrders.length}
                        {isHistoryOrdersExpanded ? (
                          <ChevronUp className="size-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="size-4 text-slate-500" />
                        )}
                      </span>
                    </button>
                  </div>
                  {isHistoryOrdersExpanded ? (
                    <div className="space-y-2 rounded-xl border border-orange-100 p-3">
                      {merchantHistoryOrders.length === 0 ? (
                        <p className="text-sm text-slate-500">暂无历史订单。</p>
                      ) : (
                        merchantHistoryOrders.map((order) => (
                          <div key={`history-${order.id}`} className="rounded-xl bg-slate-50 p-3">
                            <p className="font-medium text-slate-900">订单号：{order.id}</p>
                            <p className="mt-1 text-sm text-slate-600">订单状态：{order.status}</p>
                            <p className="mt-1 text-sm text-slate-600">总金额：{order.totalAmount} 元</p>
                            <p className="mt-1 text-sm text-slate-600">下单时间：{order.placedAt}</p>
                            <p className="mt-1 text-sm text-slate-600">订单菜品：{order.items.map((item) => `${item.name} x${item.quantity}`).join('、')}</p>
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between rounded-xl border border-orange-100 p-3">
                    <span>总成交额（模拟）</span>
                    <span>{merchantHistoryOrders.reduce((sum, item) => sum + item.totalAmount, 0)} 元</span>
                  </div>
                </>
              ) : (
                <p>当前未选择店铺。</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-white/95">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <p className="text-sm text-slate-700">可随时切换已创建店铺，查看对应店铺数据。</p>
              <Button onClick={() => setIsStoreDialogOpen(true)}>更改店铺</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isStoreDialogOpen} onOpenChange={setIsStoreDialogOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border border-orange-100 bg-white p-6">
          <DialogHeader>
            <DialogTitle>选择店铺</DialogTitle>
            <DialogDescription>可选择已有店铺，或创建新店铺后进入管理。</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-900">已有店铺</p>
            <div className="grid gap-2">
              {stores.length === 0 ? (
                <p className="text-sm text-slate-500">暂无店铺，请先创建。</p>
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
                    onClick={() => setSelectedStoreId(storeItem.merchant.id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{storeItem.merchant.storeName}</p>
                      <Badge variant="outline">{storeItem.merchant.category}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{storeItem.merchant.address}</p>
                  </button>
                ))
              )}
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  if (!selectedStoreId) {
                    return
                  }
                  setIsStoreDialogOpen(false)
                }}
                disabled={!selectedStoreId}
              >
                进入所选店铺
              </Button>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-dashed border-orange-200 p-4">
            <p className="text-sm font-medium text-slate-900">创建店铺</p>
            <div className="space-y-2">
              <Label htmlFor="create-store-name">店铺名称</Label>
              <Input
                id="create-store-name"
                value={newStoreName}
                placeholder="请输入店铺名称"
                onChange={(event) => setNewStoreName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-store-address">店铺地址</Label>
              <Input
                id="create-store-address"
                value={newStoreAddress}
                placeholder="请输入店铺地址"
                onChange={(event) => setNewStoreAddress(event.target.value)}
              />
            </div>
            <Button type="button" variant="outline" onClick={handleCreateStore}>
              创建并进入店铺
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStoreDialogOpen(false)}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isProductDialogOpen}
        onOpenChange={(open) => {
          setIsProductDialogOpen(open)
          if (!open) {
            setEditingProductId(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl rounded-2xl border border-orange-100 bg-white p-6">
          <DialogHeader>
            <DialogTitle>
              {productDialogMode === 'create' ? '新增菜品' : editingProduct ? `编辑商品：${editingProduct.name}` : '编辑商品'}
            </DialogTitle>
            <DialogDescription>
              {productDialogMode === 'create'
                ? '可在此新建菜品并设置名称、价格、描述、库存量和上架状态，月销量默认从 0 开始。'
                : '可在此修改商品名称、价格、库存量、描述，并切换商品上架/下架状态。'}
            </DialogDescription>
          </DialogHeader>

          {productDialogMode === 'create' || editingProduct ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-name">菜品名称</Label>
                  <Input
                    id="product-name"
                    value={productNameInput}
                    placeholder="请输入菜品名称"
                    onChange={(event) => setProductNameInput(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-price">商品价格</Label>
                  <Input
                    id="product-price"
                    value={priceInput}
                    placeholder="请输入商品价格"
                    onChange={(event) => setPriceInput(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-inventory">库存量</Label>
                  <Input
                    id="product-inventory"
                    value={inventoryInput}
                    placeholder="请输入库存量"
                    onChange={(event) => setInventoryInput(event.target.value)}
                  />
                  {productDialogMode === 'edit' && editingProduct ? (
                    <p className="text-xs text-slate-500">当前库存量 {editingProduct.inventoryCount}</p>
                  ) : (
                    <p className="text-xs text-slate-500">新建菜品的月销量默认记为 0。</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description">描述信息</Label>
                <Textarea
                  id="product-description"
                  value={descriptionInput}
                  placeholder="请输入商品描述"
                  onChange={(event) => setDescriptionInput(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>商品状态</Label>
                <RadioGroup
                  value={shelfStatusInput}
                  onValueChange={(value) => setShelfStatusInput(value as ProductShelfStatus)}
                  className="grid gap-2 md:grid-cols-2"
                >
                  <label className="flex items-center gap-3 rounded-xl border border-orange-100 px-4 py-3">
                    <RadioGroupItem value="上架" />
                    <span className="text-sm text-slate-700">上架</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-orange-100 px-4 py-3">
                    <RadioGroupItem value="下架" />
                    <span className="text-sm text-slate-700">下架</span>
                  </label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>操作结果</Label>
                <RadioGroup
                  value={editResult}
                  onValueChange={(value) => setEditResult(value as ProductEditResult)}
                  className="grid gap-2 md:grid-cols-2"
                >
                  <label className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
                    <RadioGroupItem value="success" />
                    <span className="text-sm text-slate-700">操作成功</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-3">
                    <RadioGroupItem value="failure" />
                    <span className="text-sm text-slate-700">操作失败</span>
                  </label>
                </RadioGroup>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsProductDialogOpen(false)
                setEditingProductId(null)
              }}
            >
              取消
            </Button>
            <Button onClick={handleProductUpdate} disabled={productDialogMode === 'edit' && !editingProduct}>
              {productDialogMode === 'create' ? '创建菜品' : '保存修改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) {
            setPendingDeleteProductId(null)
          }
        }}
      >
        <AlertDialogContent className="rounded-2xl border border-orange-100 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除菜品</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteProduct ? `删除后将无法恢复，是否确认删除「${pendingDeleteProduct.name}」？` : '删除后将无法恢复，是否继续？'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 text-white hover:bg-rose-700"
              onClick={handleDeleteProduct}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DeliveryPageShell>
  )
}
