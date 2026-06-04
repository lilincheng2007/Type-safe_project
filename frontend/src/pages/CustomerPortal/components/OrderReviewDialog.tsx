import { useRef, useState, type ChangeEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { resolveApiMediaUrl } from '@/lib/api-media-url'
import type { Order } from '@/objects/order/Order'

type OrderReviewDialogProps = {
  order: Order | null
  onOpenChange: (open: boolean) => void
  onUploadImage: (file: File) => Promise<{ ok: true; imageUrl: string } | { ok: false; message: string }>
  onSubmitReview: (input: {
    orderId: string
    merchantRating: number
    merchantDescription: string
    merchantImageUrl: string | null
    riderRating: number | null
  }) => Promise<{ ok: true } | { ok: false; message: string }>
  onNotice: (message: string, type: 'success' | 'error') => void
}

function StarSelect({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-2xl ${star <= value ? 'text-amber-400' : 'text-slate-300'}`}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export function OrderReviewDialog({ order, onOpenChange, onUploadImage, onSubmitReview, onNotice }: OrderReviewDialogProps) {
  const [merchantRating, setMerchantRating] = useState(5)
  const [riderRating, setRiderRating] = useState(5)
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setIsUploading(true)
    const result = await onUploadImage(file)
    setIsUploading(false)
    if (result.ok) {
      setImageUrl(result.imageUrl)
      onNotice('评价图片已上传。', 'success')
      return
    }
    onNotice(result.message, 'error')
  }

  const handleSubmit = async () => {
    if (!order) return
    if (!description.trim()) {
      onNotice('请填写商家评价文字。', 'error')
      return
    }
    setIsSubmitting(true)
    const result = await onSubmitReview({
      orderId: order.id,
      merchantRating,
      merchantDescription: description.trim(),
      merchantImageUrl: imageUrl.trim() || null,
      riderRating: order.riderId ? riderRating : null,
    })
    setIsSubmitting(false)
    if (result.ok) {
      setDescription('')
      setImageUrl('')
      setMerchantRating(5)
      setRiderRating(5)
      onNotice('评价已提交。', 'success')
      return
    }
    onNotice(result.message, 'error')
  }

  return (
    <Dialog open={order !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,46rem)] w-[min(42rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl bg-white p-5 sm:p-6">
        <DialogHeader className="pr-8">
          <DialogTitle className="leading-6">评价订单</DialogTitle>
          <DialogDescription className="break-all leading-5">
            {order ? `订单号：${order.id}` : '订单完成后可评价商家和骑手'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>商家等级</Label>
            <StarSelect value={merchantRating} onChange={setMerchantRating} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="merchant-review-description">文字评价</Label>
            <Textarea
              id="merchant-review-description"
              value={description}
              className="min-h-36 resize-y break-words"
              placeholder="说说这家店的口味、包装、出餐体验"
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="merchant-review-image">评价图片</Label>
            <Input
              id="merchant-review-image"
              value={imageUrl}
              className="min-w-0"
              placeholder="https://example.com/review.jpg 或上传本地图片"
              onChange={(event) => setImageUrl(event.target.value)}
            />
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
              onChange={(event) => void handleFile(event)}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? '上传中…' : '从本地上传图片'}
              </Button>
              {imageUrl.trim() ? (
                <Button type="button" variant="ghost" onClick={() => setImageUrl('')}>
                  移除图片
                </Button>
              ) : null}
            </div>
            {imageUrl.trim() ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img
                  src={resolveApiMediaUrl(imageUrl)}
                  alt="评价图片预览"
                  className="max-h-56 w-full object-contain"
                />
              </div>
            ) : null}
          </div>
          {order?.riderId ? (
            <div className="space-y-2">
              <Label>骑手等级</Label>
              <StarSelect value={riderRating} onChange={setRiderRating} />
            </div>
          ) : null}
        </div>
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            稍后评价
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? '提交中…' : '提交评价'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
