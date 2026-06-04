import { useEffect, useMemo, useRef, useState } from 'react'

import { fetchOrderChatUnreadCountsIO } from '@/apis/order/OrderChatAPI'
import { useAppChrome } from '@/hooks/useAppChrome'
import type { OrderChatRole } from '@/objects/order/OrderChatMessage'
import type { OrderChatUnreadCount } from '@/objects/order/OrderChatUnreadCount'
import type { OrderId } from '@/objects/shared/ids'

export type OrderChatUnreadLookup = (orderId: OrderId, peerRole: OrderChatRole) => number

function keyOf(orderId: OrderId, peerRole: OrderChatRole): string {
  return `${orderId}::${peerRole}`
}

export function useOrderChatUnreadCounts(enabled = true) {
  const { showNotice } = useAppChrome()
  const [counts, setCounts] = useState<OrderChatUnreadCount[]>([])
  const previousTotalRef = useRef<number | null>(null)

  const refresh = async () => {
    if (!enabled) return
    try {
      const response = await fetchOrderChatUnreadCountsIO()()
      const nextTotal = response.counts.reduce((sum, item) => sum + item.unreadCount, 0)
      const previousTotal = previousTotalRef.current
      if (previousTotal !== null && nextTotal > previousTotal) {
        showNotice(`收到 ${nextTotal - previousTotal} 条新消息。`, 'info')
      }
      previousTotalRef.current = nextTotal
      setCounts(response.counts)
    } catch {
      // Auth or backend availability errors are already surfaced by normal page actions.
    }
  }

  useEffect(() => {
    if (!enabled) return
    void refresh()
    const timer = window.setInterval(() => {
      void refresh()
    }, 5000)
    return () => window.clearInterval(timer)
  }, [enabled])

  const lookup = useMemo(() => {
    const map = new Map(counts.map((item) => [keyOf(item.orderId, item.peerRole), item.unreadCount]))
    return ((orderId: OrderId, peerRole: OrderChatRole) => map.get(keyOf(orderId, peerRole)) ?? 0) satisfies OrderChatUnreadLookup
  }, [counts])

  return { counts, unreadFor: lookup, refreshUnreadCounts: refresh }
}
