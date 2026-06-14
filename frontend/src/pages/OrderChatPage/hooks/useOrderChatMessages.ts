import { useCallback, useEffect, useState } from 'react'

import { fetchOrderChatMessagesIO, sendOrderChatMessageIO, uploadOrderChatImageIO } from '@/apis/order/OrderChatClient'
import type { OrderChatMessage, OrderChatRole } from '@/objects/order/OrderChatMessage'
import type { PendingChatImage } from './usePendingChatImage'

export function useOrderChatMessages(orderId: string, peerRole: OrderChatRole | null) {
  const [messages, setMessages] = useState<OrderChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMessages = useCallback(async (showLoading: boolean) => {
    if (!orderId || !peerRole) return
    if (showLoading) setLoading(true)
    try {
      const response = await fetchOrderChatMessagesIO(orderId, peerRole)()
      setMessages(response.messages)
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '聊天记录加载失败')
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [orderId, peerRole])

  useEffect(() => {
    void loadMessages(true)
    const timer = window.setInterval(() => {
      void loadMessages(false)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [loadMessages])

  const sendMessage = async (input: {
    draft: string
    pendingImage: PendingChatImage | null
    clearPendingImage: () => void
    clearDraft: () => void
  }) => {
    const content = input.draft.trim()
    if ((!content && !input.pendingImage) || !orderId || !peerRole || sending) return

    setSending(true)
    try {
      let latestMessages = messages

      if (input.pendingImage) {
        const imageUrl = await uploadOrderChatImageIO(input.pendingImage.file)()
        const imageResponse = await sendOrderChatMessageIO(orderId, peerRole, 'image', imageUrl)()
        latestMessages = imageResponse.messages
        input.clearPendingImage()
      }

      if (content) {
        const textResponse = await sendOrderChatMessageIO(orderId, peerRole, 'text', content)()
        latestMessages = textResponse.messages
      }

      setMessages(latestMessages)
      input.clearDraft()
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '消息发送失败')
    } finally {
      setSending(false)
    }
  }

  return {
    messages,
    loading,
    sending,
    error,
    loadMessages,
    sendMessage,
  }
}
