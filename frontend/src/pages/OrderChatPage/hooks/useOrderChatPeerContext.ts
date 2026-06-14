import { useEffect, useState } from 'react'

import { fetchCatalogIO } from '@/apis/merchant/CatalogAPI'
import { fetchMerchantMeIO } from '@/apis/merchant/MerchantMeAPI'
import { fetchCustomerOrdersIO } from '@/apis/order/CustomerOrdersAPI'
import { fetchRiderMeIO } from '@/apis/rider/RiderMeAPI'
import { UserRoles } from '@/objects/shared/ids'
import type { OrderChatRole } from '@/objects/order/OrderChatMessage'
import { customerDisplay, roleLabels } from '../functions/chatHelpers'

export function useOrderChatPeerContext(
  orderId: string,
  peerRole: OrderChatRole | null,
  currentRole: OrderChatRole | null,
) {
  const [peerTitle, setPeerTitle] = useState('')
  const [contextLine, setContextLine] = useState('')

  useEffect(() => {
    if (!orderId || !peerRole || !currentRole) return

    const loadPeerContext = async () => {
      try {
        if (currentRole === UserRoles.customer) {
          const [ordersResponse, catalog] = await Promise.all([fetchCustomerOrdersIO()(), fetchCatalogIO()()])
          const order = [...ordersResponse.pendingOrders, ...ordersResponse.historyOrders].find((item) => item.id === orderId)
          const merchant = order ? catalog.merchants.find((item) => item.id === order.merchantId) : null
          setPeerTitle(peerRole === UserRoles.merchant ? (merchant?.storeName ?? '商家') : (order?.riderId ? `骑手 ${order.riderId}` : '骑手'))
          setContextLine(merchant ? `订单 ${orderId} · ${merchant.storeName}` : `订单 ${orderId}`)
          return
        }

        if (currentRole === UserRoles.merchant) {
          const me = await fetchMerchantMeIO()()
          const stores = me.merchantAccount.profile.stores ?? []
          const orders = stores.flatMap((store) => [...store.pendingOrders, ...store.historyOrders])
          const order = orders.find((item) => item.id === orderId)
          const store = stores.find((item) => item.merchant.id === order?.merchantId)
          setPeerTitle(peerRole === UserRoles.customer ? customerDisplay(order) : (order?.riderId ? `骑手 ${order.riderId}` : '骑手'))
          setContextLine(`订单 ${orderId}${store ? ` · ${store.merchant.storeName}` : ''}`)
          return
        }

        if (currentRole === UserRoles.rider) {
          const [me, catalog] = await Promise.all([
            fetchRiderMeIO()(),
            fetchCatalogIO()().catch(() => ({ merchants: [], products: [], platformPromotions: [] })),
          ])
          const orders = [
            ...(me.riderAccount.profile.pendingOrders ?? []),
            ...(me.riderAccount.profile.historyOrders ?? []),
            ...(me.availableOrders ?? []),
          ]
          const order = orders.find((item) => item.id === orderId)
          const merchant = order ? catalog.merchants.find((item) => item.id === order.merchantId) : null
          setPeerTitle(peerRole === UserRoles.customer ? customerDisplay(order) : (merchant?.storeName ?? '商家'))
          setContextLine(`订单 ${orderId}${merchant ? ` · ${merchant.storeName}` : ''}`)
        }
      } catch {
        setPeerTitle(roleLabels[peerRole])
        setContextLine(`订单 ${orderId}`)
      }
    }

    void loadPeerContext()
  }, [currentRole, orderId, peerRole])

  return {
    peerTitle,
    contextLine,
  }
}
