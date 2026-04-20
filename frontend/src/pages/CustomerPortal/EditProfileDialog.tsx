import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type EditProfileDialogProps = {
  open: boolean
  name: string
  phone: string
  defaultAddress: string
  onOpenChange: (open: boolean) => void
  onNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onDefaultAddressChange: (value: string) => void
  onConfirm: () => void
}

export function EditProfileDialog({
  open,
  name,
  phone,
  defaultAddress,
  onOpenChange,
  onNameChange,
  onPhoneChange,
  onDefaultAddressChange,
  onConfirm,
}: EditProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border border-orange-100 bg-white p-6">
        <DialogHeader>
          <DialogTitle>修改个人信息</DialogTitle>
          <DialogDescription>修改后的姓名、联系电话和常用收货地址会同步保存到后端。</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-profile-name">姓名</Label>
            <Input
              id="customer-profile-name"
              value={name}
              placeholder="请输入姓名"
              onChange={(event) => onNameChange(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-profile-phone">联系电话</Label>
            <Input
              id="customer-profile-phone"
              value={phone}
              placeholder="请输入联系电话"
              onChange={(event) => onPhoneChange(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-profile-address">常用收货地址</Label>
            <Input
              id="customer-profile-address"
              value={defaultAddress}
              placeholder="请输入常用收货地址"
              onChange={(event) => onDefaultAddressChange(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onConfirm}>保存修改</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
