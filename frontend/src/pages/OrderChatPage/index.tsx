import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAuthSession } from '@/hooks/useAuthSession'

import { ChatComposer } from './components/ChatComposer'
import { ChatHeader } from './components/ChatHeader'
import { MessageList } from './components/MessageList'
import { chatPeers, isOrderChatRole } from './functions/chatHelpers'
import { useOrderChatMessages } from './hooks/useOrderChatMessages'
import { useOrderChatPeerContext } from './hooks/useOrderChatPeerContext'
import { usePendingChatImage } from './hooks/usePendingChatImage'

export default function OrderChatPage() {
  const { orderId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const session = useAuthSession()

  const [draft, setDraft] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const messageEndRef = useRef<HTMLDivElement | null>(null)

  const sessionRole = session?.role ?? null
  const currentRole = isOrderChatRole(sessionRole) ? sessionRole : null
  const peerRole = useMemo(() => {
    const rawPeer = searchParams.get('peer')
    if (!isOrderChatRole(rawPeer) || !currentRole) return null
    return chatPeers[currentRole].includes(rawPeer) ? rawPeer : null
  }, [currentRole, searchParams])

  const { pendingImage, selectPendingImageFile, clearPendingImage } = usePendingChatImage()
  const { messages, loading, sending, error, sendMessage } = useOrderChatMessages(orderId, peerRole)
  const { peerTitle, contextLine } = useOrderChatPeerContext(orderId, peerRole, currentRole)

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  const canSend = draft.trim().length > 0 || pendingImage !== null

  const handleSendImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    selectPendingImageFile(file, sending)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage({
      draft,
      pendingImage,
      clearPendingImage,
      clearDraft: () => setDraft(''),
    })
  }

  if (session === undefined) return null

  if (!orderId || !currentRole || !peerRole) {
    return (
      <div className="flex min-h-screen flex-col bg-[#ededed]">
        <header className="flex h-16 items-center border-b bg-[#f7f7f7] px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="返回">
            <ArrowLeft className="size-6" />
          </Button>
          <h1 className="flex-1 text-center text-lg font-semibold">订单聊天</h1>
          <span className="size-10" />
        </header>
        <main className="flex flex-1 items-center justify-center px-6 text-center text-sm text-slate-500">聊天对象无效。</main>
      </div>
    )
  }

  return (
    <div className="flex h-screen min-h-screen flex-col bg-[#ededed]">
      <ChatHeader
        peerRole={peerRole}
        peerTitle={peerTitle}
        contextLine={contextLine}
        orderId={orderId}
        onBack={() => navigate(-1)}
      />

      <MessageList loading={loading} messages={messages} currentRole={currentRole} messageEndRef={messageEndRef} />

      {error ? <div className="shrink-0 border-t border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</div> : null}

      <ChatComposer
        draft={draft}
        pendingImage={pendingImage}
        sending={sending}
        canSend={canSend}
        fileInputRef={fileInputRef}
        onDraftChange={setDraft}
        onFileChange={handleSendImage}
        onClearPendingImage={clearPendingImage}
        onSubmit={handleSubmit}
      />
    </div>
  )
}