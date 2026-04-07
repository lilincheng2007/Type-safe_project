import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/delivery/model'
import { clearAuthSession, getAuthSession } from '@/lib/auth-session'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  roles: readonly UserRole[]
}

const navItems: NavItem[] = [
  { to: '/delivery/dashboard', label: '平台总览', roles: ['admin'] },
  { to: '/delivery/customer', label: '顾客端', roles: ['customer'] },
  { to: '/delivery/merchant', label: '商家端', roles: ['merchant'] },
  { to: '/delivery/rider', label: '骑手端', roles: ['rider'] },
  { to: '/delivery/orders', label: '订单中心', roles: ['admin'] },
  { to: '/delivery/admin', label: '管理后台', roles: ['admin'] },
]

interface DeliveryPageShellProps {
  title: string
  description: string
  roleBadge?: string
  children: ReactNode
}

export function DeliveryPageShell({
  title,
  description,
  roleBadge = '外卖平台',
  children,
}: DeliveryPageShellProps) {
  const navigate = useNavigate()
  const session = getAuthSession()
  const currentRole: UserRole | null = session?.role ?? null
  const visibleNavItems = navItems.filter((item) => currentRole && item.roles.includes(currentRole))

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,212,174,0.35),transparent_38%),linear-gradient(180deg,#fffaf4_0%,#fff7ee_45%,#fff4ea_100%)] px-6 py-8 sm:px-10">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-4 rounded-2xl border border-orange-100 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant="outline" className="border-orange-200 text-orange-700">
              {roleBadge}
            </Badge>
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500">
                类型安全外卖平台演示 {session ? `· ${session.account}` : ''}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  clearAuthSession()
                  navigate('/auth/login')
                }}
              >
                退出登录
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full border px-3 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-orange-100 bg-white text-slate-700 hover:bg-orange-50',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        {children}
      </section>
    </main>
  )
}
