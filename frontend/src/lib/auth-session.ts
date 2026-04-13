import type { UserRole } from '@/delivery/model'
import type { TaskIO } from '@/delivery/io/TaskIO'
import { localStorageGetItemIO, localStorageRemoveItemIO, localStorageSetItemIO, nowIO } from '@/delivery/io/browser'
import { flatMapTask, mapTask } from '@/delivery/io/TaskIO'

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

export function setAuthSessionIO(token: string, account: string, role: UserRole): TaskIO<void> {
  return flatMapTask(nowIO(), (loggedInAt) =>
    localStorageSetItemIO(
      AUTH_SESSION_KEY,
      JSON.stringify({
        token,
        account,
        role,
        loggedInAt,
      } satisfies AuthSession),
    ),
  )
}

function parseAuthSession(raw: string | null): AuthSession | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    return isAuthSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function getAuthSessionIO(): TaskIO<AuthSession | null> {
  return mapTask(localStorageGetItemIO(AUTH_SESSION_KEY), parseAuthSession)
}

export function getAuthTokenIO(): TaskIO<string | null> {
  return mapTask(getAuthSessionIO(), (session) => session?.token ?? null)
}

export function clearAuthSessionIO(): TaskIO<void> {
  return localStorageRemoveItemIO(AUTH_SESSION_KEY)
}
