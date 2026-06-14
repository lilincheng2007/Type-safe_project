import { Loader2 } from 'lucide-react'

import type { OrderChatMessage, OrderChatRole } from '@/objects/order/OrderChatMessage'
import { formatMessageTime } from '../functions/chatHelpers'

type MessageListProps = {
  loading: boolean
  messages: OrderChatMessage[]
  currentRole: OrderChatRole
  messageEndRef: React.RefObject<HTMLDivElement | null>
}

export function MessageList({ loading, messages, currentRole, messageEndRef }: MessageListProps) {
  return (
    <main className="flex-1 overflow-y-auto px-4 py-5">
      {loading ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          <Loader2 className="mr-2 size-4 animate-spin" />
          正在加载聊天记录
        </div>
      ) : messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-400">暂无聊天记录</div>
      ) : (
        <div className="space-y-4 pb-2">
          {messages.map((message) => {
            const mine = message.senderRole === currentRole
            const isImageMessage = message.messageType === 'image'
            return (
              <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] ${mine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <span className="px-1 text-xs text-slate-400">{formatMessageTime(message.createdAt)}</span>
                  <div className={isImageMessage ? '' : `rounded-2xl px-3 py-2 shadow-sm ${mine ? 'bg-emerald-500 text-white' : 'bg-white text-slate-950'}`}>
                    {isImageMessage ? (
                      <img src={message.content} alt="聊天图片" className="max-h-64 max-w-full rounded-xl object-contain shadow-sm" />
                    ) : (
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messageEndRef} />
        </div>
      )}
    </main>
  )
}
