import type { TaskIO } from '@/apis/shared/TaskIO'
import { fetchCustomerOrderChatMessagesIO } from '@/apis/order/CustomerOrderChatMessagesAPI'
import { fetchCustomerOrderChatUnreadCountsIO } from '@/apis/order/CustomerOrderChatUnreadCountsAPI'
import { uploadOrderImageFileIO as uploadCustomerOrderImageFileIO } from '@/apis/order/CustomerOrderImageFileAPI'
import { sendCustomerOrderChatMessageIO } from '@/apis/order/CustomerSendOrderChatMessageAPI'
import { fetchMerchantOrderChatMessagesIO } from '@/apis/order/MerchantOrderChatMessagesAPI'
import { fetchMerchantOrderChatUnreadCountsIO } from '@/apis/order/MerchantOrderChatUnreadCountsAPI'
import { uploadMerchantOrderImageFileIO } from '@/apis/order/MerchantOrderImageFileAPI'
import { sendMerchantOrderChatMessageIO } from '@/apis/order/MerchantSendOrderChatMessageAPI'
import { fetchRiderOrderChatMessagesIO } from '@/apis/order/RiderOrderChatMessagesAPI'
import { fetchRiderOrderChatUnreadCountsIO } from '@/apis/order/RiderOrderChatUnreadCountsAPI'
import { uploadRiderOrderImageFileIO } from '@/apis/order/RiderOrderImageFileAPI'
import { sendRiderOrderChatMessageIO } from '@/apis/order/RiderSendOrderChatMessageAPI'
import { readAuthSession } from '@/lib/auth-session'
import type { OrderChatMessageType, OrderChatRole } from '@/objects/order/OrderChatMessage'
import type { OrderChatMessagesResponse } from '@/objects/order/apiTypes/OrderChatMessagesResponse'
import type { OrderChatUnreadCountsResponse } from '@/objects/order/apiTypes/OrderChatUnreadCountsResponse'
import type { OrderId, UserRole } from '@/objects/shared/ids'
import { UserRoles } from '@/objects/shared/ids'

function currentRole(): UserRole {
  const role = readAuthSession()?.role
  if (!role) throw new Error('请先登录')
  return role
}

export function fetchOrderChatMessagesIO(orderId: OrderId, peerRole: OrderChatRole): TaskIO<OrderChatMessagesResponse> {
  const role = currentRole()
  if (role === UserRoles.customer) return fetchCustomerOrderChatMessagesIO(orderId, peerRole)
  if (role === UserRoles.merchant) return fetchMerchantOrderChatMessagesIO(orderId, peerRole)
  if (role === UserRoles.rider) return fetchRiderOrderChatMessagesIO(orderId, peerRole)
  throw new Error('当前身份不支持订单聊天')
}

export function sendOrderChatMessageIO(
  orderId: OrderId,
  peerRole: OrderChatRole,
  messageType: OrderChatMessageType,
  content: string,
): TaskIO<OrderChatMessagesResponse> {
  const role = currentRole()
  if (role === UserRoles.customer) return sendCustomerOrderChatMessageIO(orderId, peerRole, messageType, content)
  if (role === UserRoles.merchant) return sendMerchantOrderChatMessageIO(orderId, peerRole, messageType, content)
  if (role === UserRoles.rider) return sendRiderOrderChatMessageIO(orderId, peerRole, messageType, content)
  throw new Error('当前身份不支持订单聊天')
}

export function fetchOrderChatUnreadCountsIO(): TaskIO<OrderChatUnreadCountsResponse> {
  const role = currentRole()
  if (role === UserRoles.customer) return fetchCustomerOrderChatUnreadCountsIO()
  if (role === UserRoles.merchant) return fetchMerchantOrderChatUnreadCountsIO()
  if (role === UserRoles.rider) return fetchRiderOrderChatUnreadCountsIO()
  throw new Error('当前身份不支持订单聊天')
}

export function uploadOrderChatImageIO(file: File): TaskIO<string> {
  const role = currentRole()
  if (role === UserRoles.customer) return uploadCustomerOrderImageFileIO(file)
  if (role === UserRoles.merchant) return uploadMerchantOrderImageFileIO(file)
  if (role === UserRoles.rider) return uploadRiderOrderImageFileIO(file)
  throw new Error('当前身份不支持订单聊天')
}
