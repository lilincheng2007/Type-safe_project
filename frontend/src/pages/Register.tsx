import { KeyRound, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { UserRole } from '@/delivery/model'
import { registerIO, runTask } from '@/api'
import { useAppChrome } from '@/hooks/useAppChrome'

type RegisterRole = Exclude<UserRole, 'admin'>

const registerRoleOptions: Array<{ value: RegisterRole; label: string }> = [
  { value: 'customer', label: '顾客' },
  { value: 'merchant', label: '商家' },
  { value: 'rider', label: '骑手' },
]

function isRegisterRole(value: string): value is RegisterRole {
  return value === 'customer' || value === 'merchant' || value === 'rider'
}

export default function Register() {
  const navigate = useNavigate()
  const { showNotice } = useAppChrome()

  const [role, setRole] = useState<RegisterRole>('customer')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!account.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage('请完整填写账号和两次密码。')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('两次输入的密码不一致。')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    try {
      await runTask(registerIO({ role, username: account.trim(), password: password.trim() }))
      showNotice('注册成功，请登录。', 'success')
      navigate('/auth/login')
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '注册失败')
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
            <CardTitle className="text-2xl text-slate-900">注册账号</CardTitle>
            <CardDescription>请输入账号与两次密码完成注册</CardDescription>
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
                <Label htmlFor="register-role">角色（管理员不可注册）</Label>
                <Select
                  value={role}
                  onValueChange={(value) => {
                    if (isRegisterRole(value)) {
                      setRole(value)
                    }
                  }}
                >
                  <SelectTrigger id="register-role" className="h-11 rounded-xl">
                    <SelectValue placeholder="请选择注册角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {registerRoleOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-account">账号</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="register-account"
                    value={account}
                    placeholder="请输入账号"
                    autoComplete="username"
                    className="h-11 rounded-xl border-slate-200 pl-10"
                    onChange={(event) => setAccount(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">密码</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    placeholder="请输入密码"
                    autoComplete="new-password"
                    className="h-11 rounded-xl border-slate-200 pl-10"
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">确认密码</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="register-confirm-password"
                    type="password"
                    value={confirmPassword}
                    placeholder="请再次输入密码"
                    autoComplete="new-password"
                    className="h-11 rounded-xl border-slate-200 pl-10"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
              </div>

              {errorMessage ? (
                <Alert variant="destructive" className="rounded-xl border-rose-200 bg-rose-50/90">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? '提交中…' : '注册'}
              </Button>

              <Button asChild type="button" variant="link" className="h-auto w-full px-0 text-slate-600">
                <Link to="/auth/login">已有账号？返回登录</Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
