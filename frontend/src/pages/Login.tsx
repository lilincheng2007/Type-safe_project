import { KeyRound, LogIn, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { UserRole } from '@/delivery/model'
import { runTask } from '@/api/shared/client'
import { loginIO } from '@/api/user/LoginApi'
import { getDefaultRouteForRole, isUserRole, setAuthSessionIO } from '@/lib/auth-session'

const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: 'customer', label: '顾客' },
  { value: 'merchant', label: '商家' },
  { value: 'rider', label: '骑手' },
  { value: 'admin', label: '管理员' },
]

export default function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState<UserRole>('customer')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const roleLabel = useMemo(() => {
    if (role === 'customer') return '顾客'
    if (role === 'merchant') return '商家'
    if (role === 'rider') return '骑手'
    return '管理员'
  }, [role])

  const handleSubmit = async () => {
    const trimmedAccount = account.trim()
    const trimmedPassword = password.trim()
    if (!trimmedAccount || !trimmedPassword) {
      setErrorMessage('请输入账号和密码。')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    try {
      const data = await runTask(loginIO({ role, username: trimmedAccount, password: trimmedPassword }))
      await runTask(setAuthSessionIO(data.token, data.username, data.role))
      navigate(getDefaultRouteForRole(data.role))
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '登录失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,212,174,0.35),transparent_36%),linear-gradient(180deg,#fffaf4_0%,#fff7ee_48%,#fff4ea_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.6),transparent_42%,rgba(15,23,42,0.04)_100%)]" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16 sm:px-8">
        <Card className="w-full max-w-lg border-orange-100 bg-white/92 py-0 shadow-[0_28px_80px_rgba(15,23,42,0.1)]">
          <CardHeader className="gap-3 border-b border-orange-100 px-7 py-7">
            <CardTitle className="text-2xl text-slate-900">外卖平台登录</CardTitle>
            <CardDescription>选择角色后输入账号密码即可进入对应端</CardDescription>
          </CardHeader>
          <CardContent className="px-7 py-7">
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault()
                handleSubmit()
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="role">角色</Label>
                <Select
                  value={role}
                  onValueChange={(value) => {
                    if (isUserRole(value)) {
                      setRole(value)
                    }
                  }}
                >
                  <SelectTrigger id="role" className="h-11 rounded-xl">
                    <SelectValue placeholder="请选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">当前选择：{roleLabel}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">账号</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="account"
                    value={account}
                    placeholder="请输入账号"
                    autoComplete="username"
                    className="h-11 rounded-xl border-slate-200 pl-10"
                    onChange={(event) => setAccount(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    placeholder="请输入密码"
                    autoComplete="current-password"
                    className="h-11 rounded-xl border-slate-200 pl-10"
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
              </div>

              {errorMessage ? (
                <Alert variant="destructive" className="rounded-xl border-rose-200 bg-rose-50/90">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
                <LogIn className="size-4" />
                {isSubmitting ? '登录中…' : '登录'}
              </Button>

              <Button asChild type="button" variant="link" className="h-auto w-full px-0 text-slate-600">
                <Link to="/auth/register">没有账号？去注册</Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
