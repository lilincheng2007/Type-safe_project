import type { UserRole } from '@/delivery/model'

export interface AuthSession {
  token: string
  account: string
  role: UserRole
  loggedInAt: number
}

const AUTH_SESSION_KEY = 'delivery-platform-auth-session-v2'

type RoleHomeRoute = '/delivery/customer' | '/delivery/merchant' | '/delivery/rider' | '/delivery/dashboard'

const roleHomeRouteMap: Record<UserRole, RoleHomeRoute> = {
  customer: '/delivery/customer',
  merchant: '/delivery/merchant',
  rider: '/delivery/rider',
  admin: '/delivery/dashboard',
}

export function isUserRole(value: unknown): value is UserRole {
  return value === 'customer' || value === 'merchant' || value === 'rider' || value === 'admin'
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>
  return (
    typeof record.token === 'string' &&
    record.token.length > 0 &&
    typeof record.account === 'string' &&
    record.account.length > 0 &&
    isUserRole(record.role) &&
    typeof record.loggedInAt === 'number'
  )
}

export function getDefaultRouteForRole(role: UserRole): RoleHomeRoute {
  return roleHomeRouteMap[role]
}

export function setAuthSession(token: string, account: string, role: UserRole) {
  const session: AuthSession = {
    token,
    account,
    role,
    loggedInAt: Date.now(),
  }
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

export function getAuthSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    return isAuthSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function getAuthToken(): string | null {
  return getAuthSession()?.token ?? null
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY)
}
