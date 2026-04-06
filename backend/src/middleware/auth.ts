import type { Context, MiddlewareHandler, Next } from 'hono'
import { verifyToken } from '../auth/jwt.js'
import type { UserRole } from '../types.js'

declare module 'hono' {
  interface ContextVariableMap {
    username: string
    role: UserRole
  }
}

export const authMiddleware: MiddlewareHandler = async (c: Context, next: Next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  try {
    const payload = verifyToken(header.slice(7))
    c.set('username', payload.sub)
    c.set('role', payload.role)
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

export function requireRole(...allowed: UserRole[]): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const role = c.get('role')
    if (!allowed.includes(role)) {
      return c.json({ error: 'Forbidden' }, 403)
    }
    await next()
  }
}
