import { Hono } from 'hono'
import type { MerchantProfile } from '../types.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import {
  checkoutCustomer,
  createMerchantStore,
  getAppState,
  patchCustomerProfile,
  replaceMerchantProfile,
} from '../store/deliveryStore.js'

export const deliveryRoutes = new Hono()

deliveryRoutes.use('/delivery/*', authMiddleware)

deliveryRoutes.get('/delivery/catalog', (c) => {
  const s = getAppState()
  return c.json({ merchants: s.catalogMerchants, products: s.catalogProducts })
})

deliveryRoutes.post('/delivery/me/customer/checkout', requireRole('customer'), async (c) => {
  const username = c.get('username')
  const body = await c.req.json<{ lines: { merchantId: string; productId: string; quantity: number }[] }>()
  const result = checkoutCustomer(username, body.lines ?? [])
  if (!result.ok) {
    return c.json({ error: result.message }, 400)
  }
  return c.json({ orders: result.orders, walletBalance: result.walletBalance })
})

deliveryRoutes.patch('/delivery/me/customer/profile', requireRole('customer'), async (c) => {
  const username = c.get('username')
  const body = await c.req.json<{
    walletBalance?: number
    defaultAddress?: string
    name?: string
    phone?: string
  }>()
  const r = patchCustomerProfile(username, body)
  if (!r.ok) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

deliveryRoutes.put('/delivery/me/merchant/profile', requireRole('merchant'), async (c) => {
  const username = c.get('username')
  const body = await c.req.json<{ profile: MerchantProfile }>()
  const r = replaceMerchantProfile(username, body.profile)
  if (!r.ok) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

deliveryRoutes.post('/delivery/me/merchant/stores', requireRole('merchant'), async (c) => {
  const username = c.get('username')
  const body = await c.req.json<{ storeName: string; address: string }>()
  const storeName = String(body.storeName ?? '').trim()
  const address = String(body.address ?? '').trim()
  if (!storeName || !address) {
    return c.json({ error: '店铺名称与地址不能为空' }, 400)
  }
  const r = createMerchantStore(username, storeName, address)
  if (!r.ok) return c.json({ error: r.message ?? '创建失败' }, 400)
  return c.json({ ok: true, merchantId: r.merchantId })
})

deliveryRoutes.get('/delivery/overview', requireRole('admin'), (c) => {
  const s = getAppState()
  return c.json({
    merchants: s.catalogMerchants,
    orders: s.orders,
    riders: s.riders,
    campaigns: s.campaigns,
    complaintTickets: s.complaintTickets,
  })
})

deliveryRoutes.get('/delivery/orders-panel', requireRole('admin'), (c) => {
  const s = getAppState()
  return c.json({ orders: s.orders, riders: s.riders })
})

deliveryRoutes.get('/delivery/platform-meta', requireRole('admin'), (c) => {
  const s = getAppState()
  return c.json({
    campaigns: s.campaigns,
    complaintTickets: s.complaintTickets,
    merchantApplications: s.merchantApplications,
    serviceAgents: s.serviceAgents,
    operationsManagers: s.operationsManagers,
  })
})
