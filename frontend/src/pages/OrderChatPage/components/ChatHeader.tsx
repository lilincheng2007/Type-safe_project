import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { OrderChatRole } from '@/objects/order/OrderChatMessage'
import { roleLabels } from '../functions/chatHelpers'

type ChatHeaderProps = {
  peerRole: OrderChatRole
  peerTitle: string
  contextLine: string
  orderId: string
  onBack: () => void
}

export function ChatHeader({ peerRole, peerTitle, contextLine, orderId, onBack }: ChatHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center border-b border-slate-200 bg-[#f7f7f7] px-4">
      <Button variant="ghost" size="icon" className="cursor-pointer" onClick={onBack} aria-label="返回">
        <ArrowLeft className="size-6" />
      </Button>
      <div className="min-w-0 flex-1 text-center">
        <h1 className="truncate text-lg font-semibold text-slate-950">{peerTitle || roleLabels[peerRole]}</h1>
        <p className="truncate text-xs text-slate-500">{contextLine || `订单 ${orderId}`}</p>
      </div>
      <span className="size-10" />
    </header>
  )
}
