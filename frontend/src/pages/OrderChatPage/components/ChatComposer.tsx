import { type ChangeEvent, type FormEvent, type RefObject } from 'react'
import { ImagePlus, Loader2, Send, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PendingChatImage } from '../hooks/usePendingChatImage'

type ChatComposerProps = {
  draft: string
  pendingImage: PendingChatImage | null
  sending: boolean
  canSend: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  onDraftChange: (value: string) => void
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onClearPendingImage: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function ChatComposer({
  draft,
  pendingImage,
  sending,
  canSend,
  fileInputRef,
  onDraftChange,
  onFileChange,
  onClearPendingImage,
  onSubmit,
}: ChatComposerProps) {
  return (
    <form onSubmit={onSubmit} className="shrink-0 border-t border-slate-200 bg-[#f7f7f7] px-3 py-3">
      {pendingImage ? (
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-white p-2">
          <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <img src={pendingImage.previewUrl} alt="待发送图片" className="h-full w-full object-cover" />
            <button
              type="button"
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/55 text-white"
              onClick={onClearPendingImage}
              aria-label="移除图片"
            >
              <X className="size-3" />
            </button>
          </div>
          <span className="text-sm text-slate-500">图片已添加，点击发送后发出</span>
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="shrink-0 cursor-pointer rounded-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          aria-label="添加图片"
        >
          <ImagePlus className="size-6" />
        </Button>
        <Input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="输入消息"
          className="h-11 flex-1 rounded-md border-white bg-white"
          disabled={sending}
        />
        <Button type="submit" size="icon" className="shrink-0 cursor-pointer rounded-full" disabled={sending || !canSend} aria-label="发送">
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </form>
  )
}
