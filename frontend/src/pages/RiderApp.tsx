import { Bike, MapPinned, Route, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAuthSession } from '@/lib/auth-session'
import {
  getAccountStore,
  getRiderAccountByUsername,
  subscribeAccountStore,
  updateAccountStore,
  updateRiderAccountProfile,
} from '@/lib/account-store'
import { useMockSystem } from '@/hooks/useMockSystem'

const MAX_ACTIVE_ORDERS = 5

function resolveRiderOrderStatusLabel(status: string) {
  return status === '已完成' ? '已送达' : status
}

export default function RiderApp() {
  const { showNotice } = useMockSystem()
  const session = getAuthSession()
  const accountStore = getAccountStore()
  const riderAccount = session ? getRiderAccountByUsername(session.account) : null
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)
  const [nameInput, setNameInput] = useState(riderAccount?.profile.rider.name ?? '')
  const [, setViewVersion] = useState(0)
  const rider = riderAccount?.profile.rider ?? null
  const assignedOrders = riderAccount ? riderAccount.profile.pendingOrders : []
  const historyDeliveredOrders = riderAccount ? riderAccount.profile.historyOrders : []
  const availableGrabOrders = accountStore.availableGrabOrders
  const merchantStoreProfiles = accountStore.merchantAccounts.flatMap((account) => account.profile.stores)
  const currentRiderStatus = assignedOrders.length === 0 ? '空闲' : '配送中'
  const hasReachedOrderLimit = assignedOrders.length >= MAX_ACTIVE_ORDERS

  useEffect(() => subscribeAccountStore(() => setViewVersion((value) => value + 1)), [])

  if (!riderAccount || !rider) {
    return (
      <DeliveryPageShell
        title="骑手端核心功能"
        description="当前账号未绑定骑手信息，请先完成骑手注册资料。"
        roleBadge="骑手 APP"
      >
        <Card className="border-orange-100 bg-white/95">
          <CardContent className="p-6 text-sm text-slate-600">未找到当前骑手账号档案。</CardContent>
        </Card>
      </DeliveryPageShell>
    )
  }

  const handleUpdateName = () => {
    if (!session) {
      return
    }

    const trimmedName = nameInput.trim()
    if (!trimmedName) {
      showNotice('骑手姓名不能为空。', 'error')
      return
    }

    updateRiderAccountProfile(session.account, (profile) => ({
      ...profile,
      rider: {
        ...profile.rider,
        name: trimmedName,
      },
    }))
    setIsNameDialogOpen(false)
    showNotice('骑手姓名已更新。', 'success')
  }

  const handleGrabOrder = (orderId: string) => {
    if (!session || !riderAccount) {
      return
    }
    if (assignedOrders.length >= MAX_ACTIVE_ORDERS) {
      showNotice(`同时最多只能配送 ${MAX_ACTIVE_ORDERS} 单。`, 'info')
      return
    }

    const targetOrder = availableGrabOrders.find((order) => order.id === orderId)
    if (!targetOrder) {
      showNotice('该订单已被其他骑手抢走。', 'info')
      return
    }

    updateAccountStore((store) => ({
      ...store,
      availableGrabOrders: store.availableGrabOrders.filter((order) => order.id !== orderId),
      customerAccounts: store.customerAccounts.map((account) =>
        account.profile.id === targetOrder.customerId
          ? {
              ...account,
              profile: {
                ...account.profile,
                pendingOrders: account.profile.pendingOrders.map((order) =>
                  order.id === orderId
                    ? {
                        ...order,
                        status: '配送中',
                        riderId: rider.id,
                        customerConfirmedReceipt: false,
                      }
                    : order,
                ),
              },
            }
          : account,
      ),
      riderAccounts: store.riderAccounts.map((account) =>
        account.username === session.account
          ? {
              ...account,
              profile: {
                ...account.profile,
                rider: {
                  ...account.profile.rider,
                  status: '配送中',
                },
                pendingOrders: [
                  {
                    ...targetOrder,
                    status: '配送中',
                    riderId: account.profile.rider.id,
                    customerConfirmedReceipt: false,
                  },
                  ...account.profile.pendingOrders,
                ],
              },
            }
          : account,
      ),
    }))
    setViewVersion((value) => value + 1)
    showNotice('抢单成功，请尽快前往商家取餐。', 'success')
  }

  const handleDeliverOrder = (orderId: string) => {
    if (!session || !riderAccount) {
      return
    }

    const deliveredOrder = assignedOrders.find((order) => order.id === orderId)
    if (!deliveredOrder) {
      return
    }

    updateAccountStore((store) => ({
      ...store,
      customerAccounts: store.customerAccounts.map((account) =>
        account.profile.id === deliveredOrder.customerId
          ? {
              ...account,
              profile: {
                ...account.profile,
                pendingOrders: account.profile.pendingOrders.map((order) =>
                  order.id === orderId
                    ? {
                        ...order,
                        status: '已送达',
                        customerConfirmedReceipt: false,
                      }
                    : order,
                ),
              },
            }
          : account,
      ),
      riderAccounts: store.riderAccounts.map((account) =>
        account.username === session.account
          ? {
              ...account,
              profile: {
                ...account.profile,
                rider: {
                  ...account.profile.rider,
                  status: account.profile.pendingOrders.length - 1 === 0 ? '空闲' : '配送中',
                  totalOrders: account.profile.historyOrders.length + 1,
                  salary: account.profile.rider.salary + 5,
                },
                pendingOrders: account.profile.pendingOrders.filter((order) => order.id !== orderId),
                historyOrders: [
                  {
                    ...deliveredOrder,
                    status: '已送达',
                    customerConfirmedReceipt: false,
                  },
                  ...account.profile.historyOrders,
                ],
              },
            }
          : account,
      ),
    }))
    setViewVersion((value) => value + 1)
    showNotice('订单已送达，等待顾客确认收货。', 'success')
  }

  return (
    <DeliveryPageShell
      title="骑手端核心功能"
      description="支持骑手注册登录、抢单、查看订单详情与导航、更新配送状态。"
      roleBadge="骑手 APP"
    >
      <section className="grid gap-4 md:grid-cols-4">
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>骑手姓名</CardDescription>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{rider.name}</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setIsNameDialogOpen(true)}>
                修改姓名
              </Button>
            </div>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>当前状态</CardDescription>
            <CardTitle>{currentRiderStatus}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>累计接单</CardDescription>
            <CardTitle>{historyDeliveredOrders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-orange-100 bg-white/95 py-0">
          <CardHeader className="pb-2">
            <CardDescription>评分</CardDescription>
            <CardTitle>{rider.rating.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bike className="size-5 text-orange-500" />
            抢单
          </CardTitle>
          <CardDescription>骑手可主动参与抢单，成功后进入当前配送任务。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl border border-orange-100 p-4 text-sm text-slate-700">
            当前定位：{rider.realtimeLocation} · 所属站点：{rider.station}
          </div>
          {availableGrabOrders.length === 0 ? (
            <p className="text-sm text-slate-500">当前暂无可抢订单。</p>
          ) : (
            availableGrabOrders.map((order) => {
              const merchant = merchantStoreProfiles.find((store) => store.merchant.id === order.merchantId)?.merchant

              return (
                <div key={order.id} className="space-y-3 rounded-xl border border-orange-100 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">订单号：{order.id}</p>
                      <p className="text-sm text-slate-600">总金额：{order.totalAmount} 元</p>
                    </div>
                    <Badge variant="outline">{hasReachedOrderLimit ? `已达上限（${MAX_ACTIVE_ORDERS} 单）` : '可抢单'}</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>订单菜品：{order.items.map((item) => `${item.name} x${item.quantity}`).join('、')}</p>
                    <p>商家名称：{merchant?.storeName ?? '未知商家'}</p>
                    <p>商家地址：{merchant?.address ?? '未知地址'}</p>
                    <p>顾客地址：{order.deliveryAddress}</p>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleGrabOrder(order.id)} disabled={hasReachedOrderLimit}>
                      {hasReachedOrderLimit ? '已达配送上限' : '抢单'}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinned className="size-5 text-orange-500" />
            配送任务
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assignedOrders.length === 0 ? (
            <p className="text-sm text-slate-500">当前暂无配送任务。</p>
          ) : (
            assignedOrders.map((order) => {
              const merchant = merchantStoreProfiles.find((store) => store.merchant.id === order.merchantId)?.merchant

              return (
                <div key={order.id} className="space-y-3 rounded-xl border border-orange-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">订单号：{order.id}</p>
                      <p className="text-sm text-slate-600">总金额：{order.totalAmount} 元</p>
                    </div>
                    <Badge variant="outline">{resolveRiderOrderStatusLabel(order.status)}</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>订单菜品：{order.items.map((item) => `${item.name} x${item.quantity}`).join('、')}</p>
                    <p>商家名称：{merchant?.storeName ?? '未知商家'}</p>
                    <p>商家地址：{merchant?.address ?? '未知地址'}</p>
                    <p>顾客地址：{order.deliveryAddress}</p>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => handleDeliverOrder(order.id)}>
                      <Route className="size-4" />
                      已送达
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinned className="size-5 text-orange-500" />
            历史配送订单
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {historyDeliveredOrders.length === 0 ? (
            <p className="text-sm text-slate-500">当前暂无历史配送订单。</p>
          ) : (
            historyDeliveredOrders.map((order) => {
              const merchant = merchantStoreProfiles.find((store) => store.merchant.id === order.merchantId)?.merchant

              return (
                <div key={`history-${order.id}`} className="space-y-3 rounded-xl border border-orange-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">订单号：{order.id}</p>
                      <p className="text-sm text-slate-600">总金额：{order.totalAmount} 元</p>
                    </div>
                    <Badge variant="outline">{resolveRiderOrderStatusLabel(order.status)}</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>订单菜品：{order.items.map((item) => `${item.name} x${item.quantity}`).join('、')}</p>
                    <p>商家名称：{merchant?.storeName ?? '未知商家'}</p>
                    <p>商家地址：{merchant?.address ?? '未知地址'}</p>
                    <p>顾客地址：{order.deliveryAddress}</p>
                    {order.customerConfirmedReceipt ? <p className="font-medium text-emerald-600">顾客已接收</p> : null}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card className="border-orange-100 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-orange-500" />
            薪资与合规
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          当前账户余额：{riderAccount.profile.walletBalance} 元；当月薪资（模拟）：{rider.salary} 元。客服可在严重投诉场景下触发扣款流程。
        </CardContent>
      </Card>

      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-orange-100 bg-white p-6">
          <DialogHeader>
            <DialogTitle>修改骑手姓名</DialogTitle>
            <DialogDescription>输入新的骑手姓名后保存，修改会同步到当前账号档案。</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rider-name">骑手姓名</Label>
            <Input
              id="rider-name"
              value={nameInput}
              placeholder="请输入骑手姓名"
              onChange={(event) => setNameInput(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNameDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateName}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DeliveryPageShell>
  )
}
