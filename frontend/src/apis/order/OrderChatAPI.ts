import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import { readAuthSession } from '@/lib/auth-session'
import { getLocalImageFileError } from '@/lib/local-image-file'
import type { OrderChatMessageType, OrderChatRole } from '@/objects/order/OrderChatMessage'
import type { OrderChatMessagesResponse } from '@/objects/order/apiTypes/OrderChatMessagesResponse'
import type { OrderChatUnreadCountsResponse } from '@/objects/order/apiTypes/OrderChatUnreadCountsResponse'
import type { OrderId, UserRole } from '@/objects/shared/ids'
import { UserRoles } from '@/objects/shared/ids'

class CustomerOrderChatMessagesAPI extends APIMessage<OrderChatMessagesResponse> {
  readonly apiName = 'customerorderchatmessagesapi'
  readonly orderId: OrderId
  readonly peerRole: OrderChatRole

  constructor(orderId: OrderId, peerRole: OrderChatRole) {
    super()
    this.orderId = orderId
    this.peerRole = peerRole
  }
}

class MerchantOrderChatMessagesAPI extends APIMessage<OrderChatMessagesResponse> {
  readonly apiName = 'merchantorderchatmessagesapi'
  readonly orderId: OrderId
  readonly peerRole: OrderChatRole

  constructor(orderId: OrderId, peerRole: OrderChatRole) {
    super()
    this.orderId = orderId
    this.peerRole = peerRole
  }
}

class RiderOrderChatMessagesAPI extends APIMessage<OrderChatMessagesResponse> {
  readonly apiName = 'riderorderchatmessagesapi'
  readonly orderId: OrderId
  readonly peerRole: OrderChatRole

  constructor(orderId: OrderId, peerRole: OrderChatRole) {
    super()
    this.orderId = orderId
    this.peerRole = peerRole
  }
}

class CustomerSendOrderChatMessageAPI extends APIMessage<OrderChatMessagesResponse> {
  readonly apiName = 'customersendorderchatmessageapi'
  readonly orderId: OrderId
  readonly peerRole: OrderChatRole
  readonly messageType: OrderChatMessageType
  readonly content: string

  constructor(orderId: OrderId, peerRole: OrderChatRole, messageType: OrderChatMessageType, content: string) {
    super()
    this.orderId = orderId
    this.peerRole = peerRole
    this.messageType = messageType
    this.content = content
  }
}

class CustomerOrderChatUnreadCountsAPI extends APIMessage<OrderChatUnreadCountsResponse> {
  readonly apiName = 'customerorderchatunreadcountsapi'
}

class MerchantOrderChatUnreadCountsAPI extends APIMessage<OrderChatUnreadCountsResponse> {
  readonly apiName = 'merchantorderchatunreadcountsapi'
}

class RiderOrderChatUnreadCountsAPI extends APIMessage<OrderChatUnreadCountsResponse> {
  readonly apiName = 'riderorderchatunreadcountsapi'
}

class MerchantSendOrderChatMessageAPI extends APIMessage<OrderChatMessagesResponse> {
  readonly apiName = 'merchantsendorderchatmessageapi'
  readonly orderId: OrderId
  readonly peerRole: OrderChatRole
  readonly messageType: OrderChatMessageType
  readonly content: string

  constructor(orderId: OrderId, peerRole: OrderChatRole, messageType: OrderChatMessageType, content: string) {
    super()
    this.orderId = orderId
    this.peerRole = peerRole
    this.messageType = messageType
    this.content = content
  }
}

class RiderSendOrderChatMessageAPI extends APIMessage<OrderChatMessagesResponse> {
  readonly apiName = 'ridersendorderchatmessageapi'
  readonly orderId: OrderId
  readonly peerRole: OrderChatRole
  readonly messageType: OrderChatMessageType
  readonly content: string

  constructor(orderId: OrderId, peerRole: OrderChatRole, messageType: OrderChatMessageType, content: string) {
    super()
    this.orderId = orderId
    this.peerRole = peerRole
    this.messageType = messageType
    this.content = content
  }
}

class MerchantOrderImageFileAPI extends APIMessage<string> {
  readonly apiName = 'merchantorderimagefileapi'
  readonly bytesBase64: string
  readonly contentTypeLower: string
  readonly filenameHint: string | null

  constructor(bytesBase64: string, contentTypeLower: string, filenameHint: string | null) {
    super()
    this.bytesBase64 = bytesBase64
    this.contentTypeLower = contentTypeLower
    this.filenameHint = filenameHint
  }
}

class RiderOrderImageFileAPI extends APIMessage<string> {
  readonly apiName = 'riderorderimagefileapi'
  readonly bytesBase64: string
  readonly contentTypeLower: string
  readonly filenameHint: string | null

  constructor(bytesBase64: string, contentTypeLower: string, filenameHint: string | null) {
    super()
    this.bytesBase64 = bytesBase64
    this.contentTypeLower = contentTypeLower
    this.filenameHint = filenameHint
  }
}

class CustomerOrderImageFileAPI extends APIMessage<string> {
  readonly apiName = 'customerrefundimagefileapi'
  readonly bytesBase64: string
  readonly contentTypeLower: string
  readonly filenameHint: string | null

  constructor(bytesBase64: string, contentTypeLower: string, filenameHint: string | null) {
    super()
    this.bytesBase64 = bytesBase64
    this.contentTypeLower = contentTypeLower
    this.filenameHint = filenameHint
  }
}

function currentRole(): UserRole {
  const role = readAuthSession()?.role
  if (!role) throw new Error('请先登录')
  return role
}

function chatListMessage(role: UserRole, orderId: OrderId, peerRole: OrderChatRole): APIMessage<OrderChatMessagesResponse> {
  if (role === UserRoles.customer) return new CustomerOrderChatMessagesAPI(orderId, peerRole)
  if (role === UserRoles.merchant) return new MerchantOrderChatMessagesAPI(orderId, peerRole)
  if (role === UserRoles.rider) return new RiderOrderChatMessagesAPI(orderId, peerRole)
  throw new Error('当前身份不支持订单聊天')
}

function chatSendMessage(role: UserRole, orderId: OrderId, peerRole: OrderChatRole, messageType: OrderChatMessageType, content: string): APIMessage<OrderChatMessagesResponse> {
  if (role === UserRoles.customer) return new CustomerSendOrderChatMessageAPI(orderId, peerRole, messageType, content)
  if (role === UserRoles.merchant) return new MerchantSendOrderChatMessageAPI(orderId, peerRole, messageType, content)
  if (role === UserRoles.rider) return new RiderSendOrderChatMessageAPI(orderId, peerRole, messageType, content)
  throw new Error('当前身份不支持订单聊天')
}

function unreadCountsMessage(role: UserRole): APIMessage<OrderChatUnreadCountsResponse> {
  if (role === UserRoles.customer) return new CustomerOrderChatUnreadCountsAPI()
  if (role === UserRoles.merchant) return new MerchantOrderChatUnreadCountsAPI()
  if (role === UserRoles.rider) return new RiderOrderChatUnreadCountsAPI()
  throw new Error('当前身份不支持订单聊天')
}

function imageUploadMessage(role: UserRole, bytesBase64: string, contentTypeLower: string, filenameHint: string | null): APIMessage<string> {
  if (role === UserRoles.customer) return new CustomerOrderImageFileAPI(bytesBase64, contentTypeLower, filenameHint)
  if (role === UserRoles.merchant) return new MerchantOrderImageFileAPI(bytesBase64, contentTypeLower, filenameHint)
  if (role === UserRoles.rider) return new RiderOrderImageFileAPI(bytesBase64, contentTypeLower, filenameHint)
  throw new Error('当前身份不支持订单聊天')
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('图片内容读取失败'))
        return
      }
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = () => reject(new Error('图片内容读取失败'))
    reader.readAsDataURL(file)
  })
}

export function fetchOrderChatMessagesIO(orderId: OrderId, peerRole: OrderChatRole): TaskIO<OrderChatMessagesResponse> {
  return () => sendAPI(chatListMessage(currentRole(), orderId, peerRole))()
}

export function sendOrderChatMessageIO(orderId: OrderId, peerRole: OrderChatRole, messageType: OrderChatMessageType, content: string): TaskIO<OrderChatMessagesResponse> {
  return () => sendAPI(chatSendMessage(currentRole(), orderId, peerRole, messageType, content))()
}

export function fetchOrderChatUnreadCountsIO(): TaskIO<OrderChatUnreadCountsResponse> {
  return () => sendAPI(unreadCountsMessage(currentRole()))()
}

export function uploadOrderChatImageIO(file: File): TaskIO<string> {
  return async () => {
    const fileError = getLocalImageFileError(file)
    if (fileError) throw new Error(fileError)
    const bytesBase64 = await fileToBase64(file)
    return sendAPI(imageUploadMessage(currentRole(), bytesBase64, file.type.toLowerCase(), file.name || null))()
  }
}
