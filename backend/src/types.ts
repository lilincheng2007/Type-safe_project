/** 与 frontend/src/domain-types/delivery.ts 对齐的 DTO（后端权威数据源） */

export type UserRole = 'customer' | 'merchant' | 'rider' | 'admin'

export type MerchantCategory = '中餐' | '西餐' | '零售' | '饮品甜点' | '夜宵'

export type RiderStatus = '空闲' | '接单' | '配送中'

export type ServiceChannel = '在线' | '电话'

export type OrderStatus = '待接单' | '制作中' | '配送中' | '已完成' | '已取消'

export interface Voucher {
  id: string
  title: string
  discountAmount: number
  minSpend: number
  expiresAt: string
  remainingCount: number
}

export interface Customer {
  id: string
  name: string
  phone: string
  defaultAddress: string
  walletBalance: number
  orderHistoryIds: string[]
  vouchers: Voucher[]
}

export interface Product {
  id: string
  merchantId: string
  name: string
  price: number
  description: string
  imageUrl: string
  monthlySales: number
  inventoryStatus: '充足' | '紧张' | '售罄'
  discountText?: string
}

export interface Merchant {
  id: string
  storeName: string
  category: MerchantCategory
  address: string
  phone: string
  rating: number
  tags: string[]
  featuredProductIds: string[]
}

export interface Rider {
  id: string
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
  id: string
  name: string
  department: string
  channel: ServiceChannel
  ticketIds: string[]
}

export interface OperationsManager {
  id: string
  name: string
  region: string
  managedMerchantIds: string[]
  campaignPlans: string[]
}

export interface OrderItem {
  productId: string
  name: string
  unitPrice: number
  quantity: number
}

export interface Order {
  id: string
  customerId: string
  merchantId: string
  riderId?: string
  items: OrderItem[]
  totalAmount: number
  deliveryAddress: string
  status: OrderStatus
  placedAt: string
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
  orderId: string
  customerName: string
  summary: string
  severity: '低' | '中' | '高'
  status: '待处理' | '处理中' | '已解决'
}

export interface PromotionCampaign {
  id: string
  title: string
  target: '新客' | '全体用户' | '指定商家'
  status: '草稿' | '进行中' | '已结束'
}

export interface CustomerProfile {
  id: string
  name: string
  phone: string
  defaultAddress: string
  vouchers: Voucher[]
  walletBalance: number
  pendingOrders: Order[]
  historyOrders: Order[]
}

export interface MerchantStoreProfile {
  merchant: Merchant
  products: Product[]
  pendingOrders: Order[]
  historyOrders: Order[]
}

export interface MerchantProfile {
  id: string
  ownerName: string
  phone: string
  stores: MerchantStoreProfile[]
}

export interface RiderProfile {
  rider: Rider
  walletBalance: number
  pendingOrders: Order[]
  historyOrders: Order[]
}

export interface CustomerAccount {
  role: 'customer'
  username: string
  password: string
  profile: CustomerProfile
}

export interface MerchantAccount {
  role: 'merchant'
  username: string
  password: string
  profile: MerchantProfile
}

export interface RiderAccount {
  role: 'rider'
  username: string
  password: string
  profile: RiderProfile
}

export interface AdminAccount {
  role: 'admin'
  username: string
  password: string
  displayName: string
}

export interface AccountStore {
  customerAccounts: CustomerAccount[]
  merchantAccounts: MerchantAccount[]
  riderAccounts: RiderAccount[]
  adminAccounts: AdminAccount[]
}
