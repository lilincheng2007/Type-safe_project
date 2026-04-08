import { ChartNoAxesCombined, PackageSearch, Store, Workflow } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { MerchantAccountPublic } from '@/delivery/model/accounts'
import type { MerchantStoreProfile } from '@/delivery/model/profiles'
import { createMerchantStoreIO } from '@/merchant/api/MerchantStoreApi'
import { fetchMerchantMeIO } from '@/merchant/api/MerchantMeApi'
import { runTask } from '@/shared/http/client'
import { useAppChrome } from '@/hooks/useAppChrome'

type MerchantTab = 'products' | 'orders' | 'profile'

function isMerchantTab(value: string): value is MerchantTab {
  return value === 'products' || value === 'orders' || value === 'profile'
}

export default function MerchantConsole() {
  const { showNotice } = useAppChrome()
  const [bootstrapDone, setBootstrapDone] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [merchantAccount, setMerchantAccount] = useState<MerchantAccountPublic | null>(null)
  const [activeTab, setActiveTab] = useState<MerchantTab>('products')
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [newStoreName, setNewStoreName] = useState('')
  const [newStoreAddress, setNewStoreAddress] = useState('')
  const [stores, setStores] = useState<MerchantStoreProfile[]>([])

  const refreshMerchant = useCallback(async () => {
    const me = await runTask(fetchMerchantMeIO())
    setMerchantAccount(me.merchantAccount)
    setStores(me.merchantAccount.profile.stores)
    return me.merchantAccount
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await refreshMerchant()
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : '加载失败')
      } finally {
        if (!cancelled) setBootstrapDone(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshMerchant])

  useEffect(() => {
    setIsStoreDialogOpen(true)
  }, [])

  const selectedStore = useMemo(
    () => stores.find((item) => item.merchant.id === selectedStoreId) ?? null,
    [stores, selectedStoreId],
  )

  const merchantProducts = selectedStore?.products ?? []
  const merchantPendingOrders = selectedStore?.pendingOrders ?? []
  const merchantHistoryOrders = selectedStore?.historyOrders ?? []
  const merchantOrders = [...merchantPendingOrders, ...merchantHistoryOrders]

  if (!bootstrapDone) {
    return (
      <DeliveryPageShell title="商家端后台核心功能" description="正在加载…" roleBadge="商家后台">
        <Card className="border-orange-100 bg-white/95">
          <CardContent className="p-6 text-sm text-slate-600">加载中…</CardContent>
        </Card>
      </DeliveryPageShell>
    )
  }

  if (loadError) {
    return (
      <DeliveryPageShell title="商家端后台核心功能" description="加载失败" roleBadge="商家后台">
        <Card className="border-orange-100 bg-white/95">
          <CardContent className="p-6 text-sm text-rose-600">{loadError}</CardContent>
        </Card>
      </DeliveryPageShell>
    )
  }

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

  const handleCreateStore = async () => {
    const trimmedName = newStoreName.trim()
    const trimmedAddress = newStoreAddress.trim()
    if (!trimmedName || !trimmedAddress) {
      return
    }

    try {
      const created = await runTask(createMerchantStoreIO({ storeName: trimmedName, address: trimmedAddress }))
      await refreshMerchant()
      setSelectedStoreId(created.merchantId)
      setNewStoreName('')
      setNewStoreAddress('')
      setIsStoreDialogOpen(false)
      setActiveTab('products')
    } catch (e) {
      showNotice(e instanceof Error ? e.message : '创建店铺失败', 'error')
    }
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
                  <CardTitle className="flex items-center gap-2">
                    <PackageSearch className="size-5 text-orange-500" />
                    商品管理（上架 / 下架 / 编辑）
                  </CardTitle>
                  <CardDescription>商家可实时更新商品信息与库存状态</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {merchantProducts.length === 0 ? (
                    <p className="text-sm text-slate-500">当前店铺暂无商品，请先创建菜品。</p>
                  ) : (
                    merchantProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-100 p-4"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-600">
                            月销量 {product.monthlySales} · 库存状态 {product.inventoryStatus}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => showNotice('商品编辑由后端 API 提供后再接线。', 'info')}
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => showNotice('商品上下架由后端 API 提供后再接线。', 'info')}
                          >
                            上/下架
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
                  接单与出餐处理
                </CardTitle>
                <CardDescription>处理待接单订单并推进履约流程</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {merchantOrders.length === 0 ? (
                  <p className="text-sm text-slate-500">当前店铺暂无订单。</p>
                ) : (
                  merchantOrders.map((order) => (
                    <div key={order.id} className="rounded-xl border border-orange-100 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900">订单 {order.id}</p>
                        <Badge variant="outline">{order.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">总金额 {order.totalAmount} 元</p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => showNotice('商家接单由后端 API 提供后再接线。', 'info')}
                        >
                          接单
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => showNotice('出餐完成由后端 API 提供后再接线。', 'info')}
                        >
                          出餐完成
                        </Button>
                      </div>
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
                    <span>待处理订单</span>
                    <span>{merchantPendingOrders.length}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-orange-100 p-3">
                    <span>历史订单</span>
                    <span>{merchantHistoryOrders.length}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-orange-100 p-3">
                    <span>总成交额（模拟）</span>
                    <span>{merchantOrders.reduce((sum, item) => sum + item.totalAmount, 0)} 元</span>
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
    </DeliveryPageShell>
  )
}
