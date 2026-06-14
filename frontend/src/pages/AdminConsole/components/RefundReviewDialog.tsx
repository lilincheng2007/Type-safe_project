import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { RefundReviewAction } from '../hooks/useRefundReviewDialog'

type RefundReviewDialogProps = {
  open: boolean
  action: RefundReviewAction | null
  reason: string
  processing: boolean
  onOpenChange: (open: boolean) => void
  onReasonChange: (value: string) => void
  onConfirm: () => void
}

export function RefundReviewDialog({
  open,
  action,
  reason,
  processing,
  onOpenChange,
  onReasonChange,
  onConfirm,
}: RefundReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(88vh,34rem)] w-[min(40rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl bg-white p-5 sm:p-6">
        <DialogHeader className="pr-8">
          <DialogTitle className="leading-6">
            {action === 'accept' ? '通过退款申请' : '驳回退款申请'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="refund-review-reason">
            {action === 'accept' ? '通过说明（选填）' : '驳回原因'}
          </Label>
          <Textarea
            id="refund-review-reason"
            value={reason}
            className="min-h-32 resize-y break-words"
            placeholder={action === 'accept' ? '可填写退款处理说明' : '请输入驳回退款的理由'}
            onChange={(event) => onReasonChange(event.target.value)}
          />
        </div>
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={onConfirm} disabled={processing}>
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
