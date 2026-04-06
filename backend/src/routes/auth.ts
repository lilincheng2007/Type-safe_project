import { Hono } from 'hono'
import type {
  AdminAccount,
  CustomerAccount,
  MerchantAccount,
  RiderAccount,
  UserRole,
} from '../types.js'
import { signToken } from '../auth/jwt.js'
import { authMiddleware } from '../middleware/auth.js'
import { getAppState, registerAccount, verifyLogin } from '../store/deliveryStore.js'

function omitPasswordCustomer(a: CustomerAccount): Omit<CustomerAccount, 'password'> {
  const { password: _p, ...rest } = a
  return rest
}

function omitPasswordMerchant(a: MerchantAccount): Omit<MerchantAccount, 'password'> {
  const { password: _p, ...rest } = a
  return rest
}

function omitPasswordRider(a: RiderAccount): Omit<RiderAccount, 'password'> {
  const { password: _p, ...rest } = a
  return rest
}

function omitPasswordAdmin(a: AdminAccount): Omit<AdminAccount, 'password'> {
  const { password: _p, ...rest } = a
  return rest
}

export const authRoutes = new Hono()

authRoutes.post('/login', async (c) => {
  const body = await c.req.json<{ role: UserRole; username: string; password: string }>()
  const username = String(body.username ?? '').trim()
  const password = String(body.password ?? '').trim()
  if (!username || !password) {
    return c.json({ error: '账号和密码不能为空' }, 400)
  }
  const result = verifyLogin(body.role, username, password)
  if (!result.ok) {
    return c.json(
      {
        error:
          result.reason === 'not-found' ? `未找到该角色下的账号：${username}` : '密码错误，请重新输入。',
      },
      401,
    )
  }
  const token = signToken(username, body.role)
  return c.json({ token, username, role: body.role })
})

authRoutes.post('/register', async (c) => {
  const body = await c.req.json<{ role: Exclude<UserRole, 'admin'>; username: string; password: string }>()
  const username = String(body.username ?? '').trim()
  const password = String(body.password ?? '').trim()
  if (!username || !password) {
    return c.json({ error: '账号和密码不能为空' }, 400)
  }
  const result = registerAccount(body.role, username, password)
  if (!result.ok) {
    return c.json({ error: result.message }, 400)
  }
  return c.json({ ok: true })
})

authRoutes.get('/me', authMiddleware, (c) => {
  const username = c.get('username')
  const role = c.get('role')
  const { accountStore } = getAppState()

  if (role === 'customer') {
    const a = accountStore.customerAccounts.find((item) => item.username === username)
    if (!a) return c.json({ error: 'Not found' }, 404)
    return c.json({ username, role, customerAccount: omitPasswordCustomer(a) })
  }
  if (role === 'merchant') {
    const a = accountStore.merchantAccounts.find((item) => item.username === username)
    if (!a) return c.json({ error: 'Not found' }, 404)
    return c.json({ username, role, merchantAccount: omitPasswordMerchant(a) })
  }
  if (role === 'rider') {
    const a = accountStore.riderAccounts.find((item) => item.username === username)
    if (!a) return c.json({ error: 'Not found' }, 404)
    return c.json({ username, role, riderAccount: omitPasswordRider(a) })
  }
  const a = accountStore.adminAccounts.find((item) => item.username === username)
  if (!a) return c.json({ error: 'Not found' }, 404)
  return c.json({ username, role, adminAccount: omitPasswordAdmin(a) })
})
