import { ChartNoAxesCombined, PackageSearch, Store, Workflow } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Merchant } from '@/domain-types'
import type { MerchantStoreProfile } from '@/lib/account-store'
import { getAuthSession } from '@/lib/auth-session'
import { getMerchantAccountByUsername, updateMerchantAccountProfile } from '@/lib/account-store'
import { useMockSystem } from '@/hooks/useMockSystem'

const pageName = '商家端后台'
const route = '/delivery/merchant'

type MerchantTab = 'products' | 'orders' | 'profile'

function isMerchantTab(value: string): value is MerchantTab {
  return value === 'products' || value === 'orders' || value === 'profile'
}

export default function MerchantConsole() {
  const { openMockDialog } = useMockSystem()
  const session = getAuthSession()
  const merchantAccount = session ? getMerchantAccountByUsername(session.account) : null
  const [activeTab, setActiveTab] = useState<MerchantTab>('products')
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [newStoreName, setNewStoreName] = useState('')
  const [newStoreAddress, setNewStoreAddress] = useState('')
  const [stores, setStores] = useState<MerchantStoreProfile[]>(merchantAccount?.profile.stores ?? [])

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

    const createdMerchant: Merchant = {
      id: `m-local-${Date.now()}`,
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
                            onClick={() =>
                              openMockDialog({
                                pageName,
                                route,
                                componentName: `${product.name}-编辑`,
                                interactionName: '编辑商品',
                                title: `选择「${product.name}」编辑结果`,
                                description: '模拟商家编辑商品价格或描述后的结果。',
                                options: [
                                  {
                                    id: 'edit-success',
                                    title: '编辑成功',
                                    description: '商品信息已更新并同步到顾客端。',
                                    badge: 'success',
                                    noticeMessage: '商品已更新。',
                                  },
                                  {
                                    id: 'edit-invalid',
                                    title: '参数校验失败',
                                    description: '价格或描述不符合平台规范。',
                                    badge: 'warning',
                                  },
                                ],
                                onSelect: () => undefined,
                              })
                            }
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              openMockDialog({
                                pageName,
                                route,
                                componentName: `${product.name}-上下架`,
                                interactionName: '商品上下架',
                                title: `选择「${product.name}」上下架结果`,
                                description: '模拟商品上架/下架后的状态变化。',
                                options: [
                                  {
                                    id: 'on-shelf',
                                    title: '上架成功',
                                    description: '顾客端可立即检索到该商品。',
                                    badge: 'success',
                                    noticeMessage: '商品已上架。',
                                  },
                                  {
                                    id: 'off-shelf',
                                    title: '下架成功',
                                    description: '商品已从顾客端隐藏。',
                                    badge: 'info',
                                  },
                                ],
                                onSelect: () => undefined,
                              })
                            }
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
                          onClick={() =>
                            openMockDialog({
                              pageName,
                              route,
                              componentName: `订单-${order.id}-接单`,
                              interactionName: '商家接单',
                              title: `选择订单 ${order.id} 接单结果`,
                              description: '模拟商家接单时的库存与容量校验。',
                              options: [
                                {
                                  id: 'accept-order',
                                  title: '接单成功',
                                  description: '订单进入制作中状态。',
                                  badge: 'success',
                                  noticeMessage: '订单已接单。',
                                },
                                {
                                  id: 'reject-order',
                                  title: '拒单',
                                  description: '商家繁忙，订单取消并退款。',
                                  badge: 'warning',
                                },
                              ],
                              onSelect: () => undefined,
                            })
                          }
                        >
                          接单
                        </Button>
                        <Button size="sm" variant="outline">
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
