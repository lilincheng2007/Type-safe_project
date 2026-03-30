import { Clock3, LocateFixed, Minus, Plus, Search, ShoppingCart, Store, UserRound, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'

import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { MerchantId, Order, ProductId } from '@/domain-types'
import { getAuthSession } from '@/lib/auth-session'
import { getCustomerAccountByUsername, updateCustomerAccountProfile } from '@/lib/account-store'
import { useMockSystem } from '@/hooks/useMockSystem'
import { merchants, products } from '@/lib/delivery-data'

type CustomerTab = 'home' | 'cart' | 'profile'

interface CartLine {
  merchantId: MerchantId
  productId: ProductId
  quantity: number
}

function isCustomerTab(value: string): value is CustomerTab {
  return value === 'home' || value === 'cart' || value === 'profile'
}

export default function CustomerPortal() {
  const session = getAuthSession()
  const customerAccount = session ? getCustomerAccountByUsername(session.account) : null
  const { openMockDialog, showNotice } = useMockSystem()
  const [activeTab, setActiveTab] = useState<CustomerTab>('home')
  const [selectedMerchantId, setSelectedMerchantId] = useState<MerchantId>(merchants[0]?.id ?? '')
  const [cartLines, setCartLines] = useState<CartLine[]>([])
  const [walletBalance, setWalletBalance] = useState(customerAccount?.profile.walletBalance ?? 0)
  const [pendingOrders, setPendingOrders] = useState<Order[]>(customerAccount?.profile.pendingOrders ?? [])
  const [historyOrders] = useState<Order[]>(customerAccount?.profile.historyOrders ?? [])
  const [isRechargeOpen, setIsRechargeOpen] = useState(false)
  const [rechargeAmountInput, setRechargeAmountInput] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const selectedMerchant = useMemo(
    () => merchants.find((merchant) => merchant.id === selectedMerchantId) ?? null,
    [selectedMerchantId],
  )
  const selectedMerchantProducts = useMemo(
    () => products.filter((product) => product.merchantId === selectedMerchantId),
    [selectedMerchantId],
  )
  const cartGroupedByMerchant = useMemo(() => {
    const grouped: Record<string, CartLine[]> = {}
    for (const line of cartLines) {
      if (!grouped[line.merchantId]) {
        grouped[line.merchantId] = []
      }
      grouped[line.merchantId].push(line)
    }
    return grouped
  }, [cartLines])

  const cartTotal = useMemo(() => {
    return cartLines.reduce((sum, line) => {
      const product = products.find((item) => item.id === line.productId)
      return sum + (product ? product.price * line.quantity : 0)
    }, 0)
  }, [cartLines])

  const syncCustomerProfile = (nextWalletBalance: number, nextPendingOrders: Order[], nextHistoryOrders: Order[]) => {
    if (!session) {
      return
    }
    updateCustomerAccountProfile(session.account, (profile) => ({
      ...profile,
      walletBalance: nextWalletBalance,
      pendingOrders: nextPendingOrders,
      historyOrders: nextHistoryOrders,
    }))
  }

  const addProductToCart = (merchantId: MerchantId, productId: ProductId) => {
    setCartLines((prev) => {
      const matched = prev.find((line) => line.merchantId === merchantId && line.productId === productId)
      if (!matched) {
        return [...prev, { merchantId, productId, quantity: 1 }]
      }
      return prev.map((line) =>
        line.merchantId === merchantId && line.productId === productId
          ? { ...line, quantity: line.quantity + 1 }
          : line,
      )
    })
    showNotice('已加入购物车。', 'success')
  }

  const changeQuantity = (merchantId: MerchantId, productId: ProductId, nextQuantity: number) => {
    setCartLines((prev) => {
      if (nextQuantity <= 0) {
        return prev.filter((line) => !(line.merchantId === merchantId && line.productId === productId))
      }
      return prev.map((line) =>
        line.merchantId === merchantId && line.productId === productId ? { ...line, quantity: nextQuantity } : line,
      )
    })
  }

  const handleCheckout = () => {
    if (cartLines.length === 0) {
      showNotice('购物车为空，无法结算。', 'error')
      return
    }

    if (walletBalance < cartTotal) {
      showNotice('余额不足，请先充值。', 'error')
      return
    }

    const now = new Date()
    const orderTimeText = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate(),
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const groupedEntries = Object.entries(cartGroupedByMerchant)
    const createdOrders: Order[] = groupedEntries.map(([merchantId, lines], index) => {
      const items = lines
        .map((line) => {
          const product = products.find((item) => item.id === line.productId)
          if (!product) {
            return null
          }
          return {
            productId: product.id,
            name: product.name,
            unitPrice: product.price,
            quantity: line.quantity,
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)

      const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

      return {
        id: `o-local-${Date.now()}-${index + 1}`,
        customerId: customerAccount?.profile.id ?? 'unknown-customer',
        merchantId,
        items,
        totalAmount,
        deliveryAddress: customerAccount?.profile.defaultAddress ?? '请完善默认收货地址',
        status: '制作中',
        placedAt: orderTimeText,
      }
    })

    const nextWalletBalance = walletBalance - cartTotal
    const nextPendingOrders = [...createdOrders, ...pendingOrders]
    setWalletBalance(nextWalletBalance)
    setPendingOrders(nextPendingOrders)
    setCartLines([])
    setActiveTab('profile')
    syncCustomerProfile(nextWalletBalance, nextPendingOrders, historyOrders)
    showNotice(`结算成功，已创建 ${createdOrders.length} 笔待收货订单。`, 'success')
  }

  const handleRechargeConfirm = () => {
    const amount = Number.parseFloat(rechargeAmountInput)
    if (!Number.isFinite(amount) || amount <= 0) {
      showNotice('请输入有效的充值金额。', 'error')
      return
    }

    openMockDialog({
      pageName: '顾客端 APP',
      route: '/delivery/customer',
      componentName: '确认充值',
      interactionName: '充值结果模拟',
      title: '选择充值结果',
      description: `本次充值金额 ¥${amount.toFixed(2)}，请选择模拟结果。`,
      options: [
        {
          id: 'recharge-success',
          title: '充值成功',
          description: '余额增加并关闭充值窗口。',
          badge: 'success',
        },
        {
          id: 'recharge-failed',
          title: '充值失败',
          description: '余额不变，提示稍后重试。',
          badge: 'error',
        },
      ],
      onSelect: (option) => {
        if (option.id === 'recharge-success') {
          const nextWalletBalance = walletBalance + amount
          setWalletBalance(nextWalletBalance)
          setRechargeAmountInput('')
          setIsRechargeOpen(false)
          syncCustomerProfile(nextWalletBalance, pendingOrders, historyOrders)
          showNotice(`充值成功，到账 ¥${amount.toFixed(2)}。`, 'success')
          return
        }

        setIsRechargeOpen(false)
        showNotice('充值失败，请稍后重试。', 'error')
      },
    })
  }

  if (!customerAccount) {
    return (
      <DeliveryPageShell
        title="顾客端核心功能"
        description="当前账号未绑定顾客信息，请先完成顾客注册资料。"
        roleBadge="顾客 APP"
      >
        <Card className="border-orange-100 bg-white/95">
          <CardContent className="p-6 text-sm text-slate-600">未找到当前顾客账号档案。</CardContent>
        </Card>
      </DeliveryPageShell>
    )
  }

  return (
    <DeliveryPageShell
      title="顾客端核心功能"
      description="覆盖注册登录、定位、浏览搜索、购物车、下单支付、订单状态和配送轨迹等功能。"
      roleBadge="顾客 APP"
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (isCustomerTab(value)) {
            setActiveTab(value)
          }
        }}
      >
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardContent className="px-4 py-4">
            <TabsList className="grid h-11 w-full grid-cols-3 rounded-xl bg-orange-50 p-1">
              <TabsTrigger value="home" className="rounded-lg">
                首页
              </TabsTrigger>
              <TabsTrigger value="cart" className="rounded-lg">
                购物车
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-lg">
                我的
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        <TabsContent value="home" className="space-y-4">
          <section className="grid gap-4 md:grid-cols-3">
            <Card className="border-orange-100 bg-white/95 py-0">
              <CardHeader className="pb-2">
                <CardDescription>常用收货地址</CardDescription>
                <CardTitle className="flex items-center gap-2 text-base">
                  <LocateFixed className="size-4 text-orange-500" />
                  {customerAccount?.profile.defaultAddress ?? '请完善默认收货地址'}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-orange-100 bg-white/95 py-0">
              <CardHeader className="pb-2">
                <CardDescription>搜索提示</CardDescription>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Search className="size-4 text-orange-500" />
                  支持按商家/商品名搜索
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-orange-100 bg-white/95 py-0">
              <CardHeader className="pb-2">
                <CardDescription>购物车商品数</CardDescription>
                <CardTitle>{cartLines.reduce((sum, line) => sum + line.quantity, 0)} 件</CardTitle>
              </CardHeader>
            </Card>
          </section>

          <Card className="border-orange-100 bg-white/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="size-5 text-orange-500" />
                商家列表
              </CardTitle>
              <CardDescription>点击商家后可浏览该商家对应菜品</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {merchants.map((merchant) => (
                <button
                  key={merchant.id}
                  type="button"
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    selectedMerchantId === merchant.id
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-orange-100 bg-white hover:bg-orange-50/60'
                  }`}
                  onClick={() => setSelectedMerchantId(merchant.id)}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{merchant.storeName}</p>
                    <Badge variant="outline">{merchant.category}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    评分 {merchant.rating.toFixed(1)} · {merchant.address}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-white/95">
            <CardHeader>
              <CardTitle>商家菜品</CardTitle>
              <CardDescription>{selectedMerchant ? `${selectedMerchant.storeName} 的可选菜品` : '请选择商家'}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {selectedMerchantProducts.map((product) => (
                <div key={product.id} className="space-y-2 rounded-xl border border-orange-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <Badge variant="outline">{product.inventoryStatus}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-orange-600">{product.price} 元</span>
                    <Button size="sm" onClick={() => addProductToCart(product.merchantId, product.id)}>
                      <ShoppingCart className="size-4" />
                      加入购物车
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cart" className="space-y-4">
          <Card className="border-orange-100 bg-white/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="size-5 text-orange-500" />
                购物车
              </CardTitle>
              <CardDescription>按商家分组展示已选菜品（参考外卖平台购物车布局）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(cartGroupedByMerchant).length === 0 ? (
                <div className="rounded-xl border border-dashed border-orange-200 p-8 text-center text-sm text-slate-500">
                  购物车为空，去首页选择菜品吧。
                </div>
              ) : (
                Object.entries(cartGroupedByMerchant).map(([merchantId, lines]) => {
                  const merchant = merchants.find((item) => item.id === merchantId)
                  if (!merchant) {
                    return null
                  }

                  return (
                    <div key={merchantId} className="rounded-2xl border border-orange-100 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-lg font-semibold text-slate-900">{merchant.storeName}</p>
                        <Badge variant="outline">{merchant.category}</Badge>
                      </div>
                      <div className="space-y-3">
                        {lines.map((line) => {
                          const product = products.find((item) => item.id === line.productId)
                          if (!product) {
                            return null
                          }

                          return (
                            <div key={line.productId} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3">
                              <div className="space-y-1">
                                <p className="font-medium text-slate-900">{product.name}</p>
                                <p className="text-sm text-slate-600">单价 ¥{product.price.toFixed(1)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="size-8"
                                  onClick={() => changeQuantity(line.merchantId, line.productId, line.quantity - 1)}
                                >
                                  <Minus className="size-4" />
                                </Button>
                                <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="size-8"
                                  onClick={() => changeQuantity(line.merchantId, line.productId, line.quantity + 1)}
                                >
                                  <Plus className="size-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-white/95">
            <CardContent className="flex items-center justify-between p-4">
              <div className="text-sm text-slate-700">
                合计：
                <span className="ml-1 text-xl font-semibold text-orange-600">¥{cartTotal.toFixed(1)}</span>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={cartLines.length === 0}
              >
                结算
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <section className="grid gap-4 md:grid-cols-3">
            <Card className="border-orange-100 bg-white/95 py-0">
              <CardHeader className="pb-2">
                <CardDescription>我的余额</CardDescription>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="size-4 text-orange-500" />
                  {walletBalance.toFixed(2)} 元
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-orange-100 bg-white/95 py-0">
              <CardHeader className="pb-2">
                <CardDescription>历史订单</CardDescription>
                <CardTitle>{historyOrders.length} 单</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-orange-100 bg-white/95 py-0">
              <CardHeader className="pb-2">
                <CardDescription>待收货</CardDescription>
                <CardTitle>{pendingOrders.length} 单</CardTitle>
              </CardHeader>
            </Card>
          </section>

          <Card className="border-orange-100 bg-white/95">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <p className="text-sm text-slate-700">余额不足可先充值，再返回购物车结算。</p>
              <Button onClick={() => setIsRechargeOpen(true)}>充值</Button>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-white/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="size-5 text-orange-500" />
                待收货订单
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingOrders.length === 0 ? (
                <p className="text-sm text-slate-500">暂无待收货订单。</p>
              ) : (
                pendingOrders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    className="w-full rounded-xl border border-orange-100 p-4 text-left transition-colors hover:bg-orange-50/60"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">订单号：{order.id}</p>
                      <Badge variant="outline">{order.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">收货地址：{order.deliveryAddress}</p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-white/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-5 text-orange-500" />
                历史订单
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {historyOrders.length === 0 ? (
                <p className="text-sm text-slate-500">暂无历史订单。</p>
              ) : (
                historyOrders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    className="w-full rounded-xl border border-orange-100 p-4 text-left transition-colors hover:bg-orange-50/60"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">订单号：{order.id}</p>
                      <Badge variant="outline">{order.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      金额：{order.totalAmount} 元 · 下单时间：{order.placedAt}
                    </p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isRechargeOpen} onOpenChange={setIsRechargeOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-orange-100 bg-white p-6">
          <DialogHeader>
            <DialogTitle>余额充值</DialogTitle>
            <DialogDescription>输入充值金额并确认，金额会立即计入当前账户余额。</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="recharge-amount">充值金额（元）</Label>
            <Input
              id="recharge-amount"
              type="number"
              min="0"
              step="100"
              value={rechargeAmountInput}
              placeholder="例如：100"
              onChange={(event) => setRechargeAmountInput(event.target.value)}
            />
            <p className="text-xs text-slate-500">可使用输入框右侧上下按钮按 100 调整金额。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRechargeOpen(false)}>
              取消
            </Button>
            <Button onClick={handleRechargeConfirm}>确认充值</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedOrder !== null} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-md rounded-2xl border border-orange-100 bg-white p-6">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
            <DialogDescription>
              {selectedOrder ? `订单号：${selectedOrder.id}` : '查看订单商品与金额信息'}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-orange-50 px-3 py-2 text-sm text-slate-700">
                订单金额：
                <span className="ml-1 font-semibold text-orange-600">¥{selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">商品明细</p>
                {selectedOrder.items.map((item) => (
                  <div
                    key={`${selectedOrder.id}-${item.productId}`}
                    className="flex items-center justify-between rounded-lg border border-orange-100 px-3 py-2"
                  >
                    <div className="text-sm text-slate-700">
                      <p>{item.name}</p>
                      <p className="text-xs text-slate-500">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-slate-900">¥{(item.unitPrice * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DeliveryPageShell>
  )
}
