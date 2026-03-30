export type UserId = string
export type MerchantId = string
export type RiderId = string
export type CustomerServiceAgentId = string
export type OperationsManagerId = string
export type ProductId = string
export type OrderId = string
export type VoucherId = string
export type CampaignId = string

export type UserRole = 'customer' | 'merchant' | 'rider' | 'admin'

export type MerchantCategory = '中餐' | '西餐' | '零售' | '饮品甜点' | '夜宵'

export type RiderStatus = '空闲' | '接单' | '配送中'

export type ServiceChannel = '在线' | '电话'

export type OrderStatus = '待接单' | '制作中' | '配送中' | '已送达' | '已完成' | '已取消'
export type ProductShelfStatus = '上架' | '下架'

export interface Voucher {
  id: VoucherId
  title: string
  discountAmount: number
  minSpend: number
  expiresAt: string
  remainingCount: number
}

export interface Customer {
  id: UserId
  name: string
  phone: string
  defaultAddress: string
  walletBalance: number
  orderHistoryIds: OrderId[]
  vouchers: Voucher[]
}

export interface Product {
  id: ProductId
  merchantId: MerchantId
  name: string
  price: number
  description: string
  imageUrl: string
  monthlySales: number
  inventoryCount: number
  inventoryStatus: '充足' | '紧张' | '售罄'
  shelfStatus: ProductShelfStatus
  discountText?: string
}

export interface Merchant {
  id: MerchantId
  storeName: string
  category: MerchantCategory
  address: string
  phone: string
  rating: number
  tags: string[]
  featuredProductIds: ProductId[]
}

export interface Rider {
  id: RiderId
  name: string
  phone: string
  realtimeLocation: string
  status: RiderStatus
  totalOrders: number
  rating: number
  station: string
  salary: number
}

export interface CustomerServiceAgent {
  id: CustomerServiceAgentId
  name: string
  department: string
  channel: ServiceChannel
  ticketIds: string[]
}

export interface OperationsManager {
  id: OperationsManagerId
  name: string
  region: string
  managedMerchantIds: MerchantId[]
  campaignPlans: string[]
}

export interface OrderItem {
  productId: ProductId
  name: string
  unitPrice: number
  quantity: number
}

export interface Order {
  id: OrderId
  customerId: UserId
  merchantId: MerchantId
  riderId?: RiderId
  items: OrderItem[]
  totalAmount: number
  deliveryAddress: string
  status: OrderStatus
  placedAt: string
  customerConfirmedReceipt?: boolean
}

export interface MerchantApplication {
  id: string
  applicantName: string
  storeName: string
  category: MerchantCategory
  region: string
  status: '待审核' | '已通过' | '已拒绝'
}

export interface ComplaintTicket {
  id: string
  orderId: OrderId
  customerName: string
  summary: string
  severity: '低' | '中' | '高'
  status: '待处理' | '处理中' | '已解决'
}

export interface PromotionCampaign {
  id: CampaignId
  title: string
  target: '新客' | '全体用户' | '指定商家'
  status: '草稿' | '进行中' | '已结束'
}
