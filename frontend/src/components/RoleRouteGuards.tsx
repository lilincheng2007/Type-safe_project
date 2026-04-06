import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'

import type { UserRole } from '@/domain-types'
import { getAuthSession, getDefaultRouteForRole } from '@/lib/auth-session'

interface RoleRouteGuardProps {
  allowedRoles: readonly UserRole[]
  children: ReactElement
}

export function RoleRouteGuard({ allowedRoles, children }: RoleRouteGuardProps) {
  const session = getAuthSession()

  if (!session) {
    return <Navigate replace to="/auth/login" />
  }

  if (!allowedRoles.includes(session.role)) {
    return <Navigate replace to={getDefaultRouteForRole(session.role)} />
  }

  return children
}

export function GuestRouteGuard({ children }: { children: ReactElement }) {
  const session = getAuthSession()
  if (!session) {
    return children
  }

  return <Navigate replace to={getDefaultRouteForRole(session.role)} />
}
