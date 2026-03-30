import type {
  ComplaintTicket,
  Customer,
  CustomerServiceAgent,
  Merchant,
  MerchantApplication,
  OperationsManager,
  Order,
  Product,
  PromotionCampaign,
  Rider,
} from '@/domain-types'

export const customers: Customer[] = [
  {
    id: 'u-1001',
    name: '李然',
    phone: '13800001234',
    defaultAddress: '浦东新区世纪大道 100 号 1203 室',
    walletBalance: 188.5,
    orderHistoryIds: ['o-9001', 'o-9002'],
    vouchers: [
      {
        id: 'v-1',
        title: '满30减8',
        discountAmount: 8,
        minSpend: 30,
        expiresAt: '2026-04-30',
        remainingCount: 2,
      },
    ],
  },
]

export const merchants: Merchant[] = [
  {
    id: 'm-2001',
    storeName: '阿强小炒',
    category: '中餐',
    address: '浦东新区张杨路 88 号',
    phone: '021-60001234',
    rating: 4.8,
    tags: ['五星店铺', '出餐快'],
    featuredProductIds: ['p-3001', 'p-3002'],
  },
  {
    id: 'm-2002',
    storeName: '甜点星球',
    category: '饮品甜点',
    address: '徐汇区天钥桥路 77 号',
    phone: '021-60005678',
    rating: 4.7,
    tags: ['下午茶首选'],
    featuredProductIds: ['p-3003'],
  },
]

export const products: Product[] = [
  {
    id: 'p-3001',
    merchantId: 'm-2001',
    name: '宫保鸡丁饭',
    price: 28,
    description: '经典川味，微辣。',
    imageUrl: 'https://picsum.photos/200/120?food-1',
    monthlySales: 768,
    inventoryCount: 36,
    inventoryStatus: '充足',
    shelfStatus: '上架',
    discountText: '会员价 25.5',
  },
  {
    id: 'p-3002',
    merchantId: 'm-2001',
    name: '番茄牛腩饭',
    price: 32,
    description: '慢炖牛腩，配时蔬。',
    imageUrl: 'https://picsum.photos/200/120?food-2',
    monthlySales: 514,
    inventoryCount: 8,
    inventoryStatus: '紧张',
    shelfStatus: '上架',
  },
  {
    id: 'p-3003',
    merchantId: 'm-2002',
    name: '杨枝甘露大杯',
    price: 22,
    description: '芒果+西米+西柚，冰爽口感。',
    imageUrl: 'https://picsum.photos/200/120?drink-1',
    monthlySales: 903,
    inventoryCount: 24,
    inventoryStatus: '充足',
    shelfStatus: '下架',
    discountText: '第二杯半价',
  },
]

export const riders: Rider[] = [
  {
    id: 'r-5001',
    name: '王涛',
    phone: '13900006543',
    realtimeLocation: '浦东新区商城路地铁站',
    status: '空闲',
    totalOrders: 1280,
    rating: 4.9,
    station: '陆家嘴站',
    salary: 13880,
  },
  {
    id: 'r-5002',
    name: '赵鹏',
    phone: '13700007654',
    realtimeLocation: '徐汇区肇嘉浜路',
    status: '配送中',
    totalOrders: 1024,
    rating: 4.8,
    station: '徐家汇站',
    salary: 12200,
  },
]

export const orders: Order[] = [
  {
    id: 'o-9001',
    customerId: 'u-1001',
    merchantId: 'm-2001',
    riderId: 'r-5001',
    items: [
      {
        productId: 'p-3001',
        name: '宫保鸡丁饭',
        unitPrice: 28,
        quantity: 1,
      },
      {
        productId: 'p-3002',
        name: '番茄牛腩饭',
        unitPrice: 32,
        quantity: 1,
      },
    ],
    totalAmount: 60,
    deliveryAddress: '浦东新区世纪大道 100 号 1203 室',
    status: '配送中',
    placedAt: '2026-03-29 11:42',
  },
  {
    id: 'o-9002',
    customerId: 'u-1001',
    merchantId: 'm-2002',
    riderId: 'r-5002',
    items: [
      {
        productId: 'p-3003',
        name: '杨枝甘露大杯',
        unitPrice: 22,
        quantity: 2,
      },
    ],
    totalAmount: 44,
    deliveryAddress: '浦东新区世纪大道 100 号 1203 室',
    status: '已完成',
    placedAt: '2026-03-28 17:10',
  },
]

export const serviceAgents: CustomerServiceAgent[] = [
  {
    id: 'cs-01',
    name: '陈琳',
    department: '售后服务部',
    channel: '在线',
    ticketIds: ['t-1', 't-2'],
  },
]

export const operationsManagers: OperationsManager[] = [
  {
    id: 'op-01',
    name: '吴越',
    region: '浦东新区',
    managedMerchantIds: ['m-2001', 'm-2002'],
    campaignPlans: ['周末满减冲刺', '新商家冷启动流量扶持'],
  },
]

export const merchantApplications: MerchantApplication[] = [
  {
    id: 'ma-001',
    applicantName: '张晨',
    storeName: '夜猫子烧烤',
    category: '夜宵',
    region: '杨浦区',
    status: '待审核',
  },
]

export const complaintTickets: ComplaintTicket[] = [
  {
    id: 't-1',
    orderId: 'o-9001',
    customerName: '李然',
    summary: '骑手配送绕路，超时 20 分钟。',
    severity: '中',
    status: '待处理',
  },
  {
    id: 't-2',
    orderId: 'o-9002',
    customerName: '李然',
    summary: '饮品封口破损。',
    severity: '高',
    status: '处理中',
  },
]

export const campaigns: PromotionCampaign[] = [
  {
    id: 'c-01',
    title: '新客立减 12 元',
    target: '新客',
    status: '进行中',
  },
  {
    id: 'c-02',
    title: '周末全城满 39 减 6',
    target: '全体用户',
    status: '草稿',
  },
]
