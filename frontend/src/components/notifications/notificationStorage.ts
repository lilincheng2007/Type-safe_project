import type { AuthSession } from '@/lib/auth-session'

export type GlobalNotification = {
  id: string
  message: string
  target: string
  createdAt: number
}

export type NotificationSnapshot = {
  initialized: boolean
  seenEvents: string[]
  chatCounts: Record<string, number>
}

export const emptySnapshot: NotificationSnapshot = {
  initialized: false,
  seenEvents: [],
  chatCounts: {},
}

function storageKey(session: AuthSession, suffix: string) {
  return `delivery-global-notifications:${session.role}:${session.account}:${suffix}`
}

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function readSnapshot(session: AuthSession): NotificationSnapshot {
  const value = safeReadJson<Partial<NotificationSnapshot>>(storageKey(session, 'snapshot'), emptySnapshot)
  return {
    initialized: Boolean(value.initialized),
    seenEvents: Array.isArray(value.seenEvents) ? value.seenEvents : [],
    chatCounts: value.chatCounts && typeof value.chatCounts === 'object' ? value.chatCounts : {},
  }
}

export function writeSnapshot(session: AuthSession, snapshot: NotificationSnapshot) {
  window.localStorage.setItem(storageKey(session, 'snapshot'), JSON.stringify(snapshot))
}

export function readNotifications(session: AuthSession): GlobalNotification[] {
  const value = safeReadJson<GlobalNotification[]>(storageKey(session, 'items'), [])
  return Array.isArray(value) ? value : []
}

export function writeNotifications(session: AuthSession, notifications: GlobalNotification[]) {
  window.localStorage.setItem(storageKey(session, 'items'), JSON.stringify(notifications))
}
