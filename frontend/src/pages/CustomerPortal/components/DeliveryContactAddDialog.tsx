import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type SubmitResult = { ok: true } | { ok: false; message: string }

type DeliveryContactAddDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  confirmLabel?: string
  onSubmit: (payload: {
    name: string
    phone: string
    address: string
    asDefault: boolean
  }) => Promise<SubmitResult>
}

export function DeliveryContactAddDialog({
  open,
  onOpenChange,
  title = '新增收货信息',
  description = '保存后将写入账号档案，可用于下单与默认展示。',
  confirmLabel = '保存',
  onSubmit,
}: DeliveryContactAddDialogProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [asDefault, setAsDefault] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setName('')
    setPhone('')
    setAddress('')
    setAsDefault(false)
    setError(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm()
    }
    onOpenChange(nextOpen)
  }

  const handleConfirm = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('请填写完整的联系人、电话与地址。')
      return
    }
    setBusy(true)
    setError(null)
    const result = await onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      asDefault,
    })
    setBusy(false)
    if (result.ok) {
      handleOpenChange(false)
      return
    }
    setError(result.message)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[min(88vh,34rem)] max-w-md overflow-y-auto rounded-2xl border border-border/70 bg-card p-5 shadow-2xl sm:p-6">
        <DialogHeader className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
          <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="dc-add-name">联系人</Label>
            <Input
              id="dc-add-name"
              value={name}
              className="border-border/70 bg-background"
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="收货人姓名"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dc-add-phone">电话</Label>
            <Input
              id="dc-add-phone"
              value={phone}
              className="border-border/70 bg-background"
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="手机号码"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dc-add-address">地址</Label>
            <Input
              id="dc-add-address"
              value={address}
              className="border-border/70 bg-background"
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
              placeholder="详细收货地址"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={asDefault} onCheckedChange={(v) => setAsDefault(v === true)} />
            <span>设为默认收货信息</span>
          </label>
            {error ? <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="cursor-pointer" onClick={() => handleOpenChange(false)}>
            取消
          </Button>
          <Button type="button" className="cursor-pointer" disabled={busy} onClick={() => void handleConfirm()}>
            {busy ? '保存中…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
