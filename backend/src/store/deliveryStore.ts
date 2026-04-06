import type {
  AccountStore,
  AdminAccount,
  Customer,
  CustomerAccount,
  CustomerProfile,
  Merchant,
  MerchantAccount,
  MerchantProfile,
  MerchantStoreProfile,
  Order,
  OrderItem,
  Product,
  Rider,
  RiderAccount,
  UserRole,
} from '../types.js'
import {
  seedCampaigns,
  seedComplaintTickets,
  seedCustomers,
  seedMerchantApplications,
  seedMerchants,
  seedOperationsManagers,
  seedOrders,
  seedProducts,
  seedRiders,
  seedServiceAgents,
} from '../seed/deliverySeed.js'

function deepClone<T>(value: T): T {
  return structuredClone(value)
}

function splitOrdersByHistory(sourceOrders: Order[]) {
  const pending = sourceOrders.filter((item) => item.status !== '已完成' && item.status !== '已取消')
  const history = sourceOrders.filter((item) => item.status === '已完成' || item.status === '已取消')
  return { pending, history }
}

function buildSeedAccountStore(
  customers: Customer[],
  merchants: Merchant[],
  products: Product[],
  riders: Rider[],
  orders: Order[],
): AccountStore {
  const customerAccounts: CustomerAccount[] = customers.map((customer, index) => {
    const relatedOrders = orders.filter((order) => order.customerId === customer.id)
    const { pending, history } = splitOrdersByHistory(relatedOrders)
    return {
      role: 'customer',
      username: index === 0 ? 'customer_demo' : `customer_${index + 1}`,
      password: '123456',
      profile: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        defaultAddress: customer.defaultAddress,
        vouchers: deepClone(customer.vouchers),
        walletBalance: customer.walletBalance,
        pendingOrders: deepClone(pending),
        historyOrders: deepClone(history),
      },
    }
  })

  const merchantAccounts: MerchantAccount[] = merchants.map((merchant, index) => {
    const merchantOrders = orders.filter((order) => order.merchantId === merchant.id)
    const { pending, history } = splitOrdersByHistory(merchantOrders)
    return {
      role: 'merchant',
      username: index === 0 ? 'merchant_demo' : `merchant_${index + 1}`,
      password: '123456',
      profile: {
        id: `merchant-profile-${merchant.id}`,
        ownerName: merchant.storeName,
        phone: merchant.phone,
        stores: [
          {
            merchant: deepClone(merchant),
            products: deepClone(products.filter((product) => product.merchantId === merchant.id)),
            pendingOrders: deepClone(pending),
            historyOrders: deepClone(history),
          },
        ],
      },
    }
  })

  const riderAccounts: RiderAccount[] = riders.map((rider, index) => {
    const riderOrders = orders.filter((order) => order.riderId === rider.id)
    const { pending, history } = splitOrdersByHistory(riderOrders)
    return {
      role: 'rider',
      username: index === 0 ? 'rider_demo' : `rider_${index + 1}`,
      password: '123456',
      profile: {
        rider: deepClone(rider),
        walletBalance: Math.round(rider.salary * 0.1),
        pendingOrders: deepClone(pending),
        historyOrders: deepClone(history),
      },
    }
  })

  const adminAccounts: AdminAccount[] = [
    { role: 'admin', username: 'admin', password: '123456', displayName: '平台管理员' },
  ]

  return { customerAccounts, merchantAccounts, riderAccounts, adminAccounts }
}

export interface AppState {
  customers: Customer[]
  catalogMerchants: Merchant[]
  catalogProducts: Product[]
  riders: Rider[]
  orders: Order[]
  accountStore: AccountStore
  serviceAgents: (typeof seedServiceAgents)[number][]
  operationsManagers: (typeof seedOperationsManagers)[number][]
  merchantApplications: (typeof seedMerchantApplications)[number][]
  complaintTickets: (typeof seedComplaintTickets)[number][]
  campaigns: (typeof seedCampaigns)[number][]
}

let state: AppState

export function initDeliveryStore() {
  const orders = deepClone(seedOrders)
  state = {
    customers: deepClone(seedCustomers),
    catalogMerchants: deepClone(seedMerchants),
    catalogProducts: deepClone(seedProducts),
    riders: deepClone(seedRiders),
    orders,
    accountStore: buildSeedAccountStore(
      deepClone(seedCustomers),
      deepClone(seedMerchants),
      deepClone(seedProducts),
      deepClone(seedRiders),
      orders,
    ),
    serviceAgents: deepClone(seedServiceAgents),
    operationsManagers: deepClone(seedOperationsManagers),
    merchantApplications: deepClone(seedMerchantApplications),
    complaintTickets: deepClone(seedComplaintTickets),
    campaigns: deepClone(seedCampaigns),
  }
}

export function getAppState(): AppState {
  return state
}

type RegisterableRole = Exclude<UserRole, 'admin'>

export function verifyLogin(role: UserRole, username: string, password: string) {
  const store = state.accountStore
  let matched: string | null = null
  if (role === 'customer') {
    matched = store.customerAccounts.find((item) => item.username === username)?.password ?? null
  } else if (role === 'merchant') {
    matched = store.merchantAccounts.find((item) => item.username === username)?.password ?? null
  } else if (role === 'rider') {
    matched = store.riderAccounts.find((item) => item.username === username)?.password ?? null
  } else {
    matched = store.adminAccounts.find((item) => item.username === username)?.password ?? null
  }
  if (matched === null) return { ok: false as const, reason: 'not-found' as const }
  if (matched !== password) return { ok: false as const, reason: 'wrong-password' as const }
  return { ok: true as const }
}

export function registerAccount(role: RegisterableRole, username: string, password: string) {
  const store = state.accountStore
  const alreadyExists =
    role === 'customer'
      ? store.customerAccounts.some((item) => item.username === username)
      : role === 'merchant'
        ? store.merchantAccounts.some((item) => item.username === username)
        : store.riderAccounts.some((item) => item.username === username)

  if (alreadyExists) {
    return { ok: false as const, message: '该角色下账号已存在。' }
  }

  if (role === 'customer') {
    const newCustomer: Customer = {
      id: `u-${Date.now()}`,
      name: username,
      phone: '',
      defaultAddress: '请完善默认收货地址',
      walletBalance: 0,
      orderHistoryIds: [],
      vouchers: [],
    }
    state.customers.push(newCustomer)
    store.customerAccounts.push({
      role: 'customer',
      username,
      password,
      profile: {
        id: newCustomer.id,
        name: newCustomer.name,
        phone: newCustomer.phone,
        defaultAddress: newCustomer.defaultAddress,
        vouchers: [],
        walletBalance: 0,
        pendingOrders: [],
        historyOrders: [],
      },
    })
  } else if (role === 'merchant') {
    const newMerchant: Merchant = {
      id: `m-${Date.now()}`,
      storeName: `${username}的店铺`,
      category: '中餐',
      address: '请完善店铺地址',
      phone: '',
      rating: 5,
      tags: [],
      featuredProductIds: [],
    }
    store.merchantAccounts.push({
      role: 'merchant',
      username,
      password,
      profile: {
        id: `merchant-profile-${newMerchant.id}`,
        ownerName: username,
        phone: '',
        stores: [
          {
            merchant: newMerchant,
            products: [],
            pendingOrders: [],
            historyOrders: [],
          },
        ],
      },
    })
  } else {
    const newRider: Rider = {
      id: `r-${Date.now()}`,
      name: username,
      phone: '',
      realtimeLocation: '请更新当前位置',
      status: '空闲',
      totalOrders: 0,
      rating: 5,
      station: '未分配站点',
      salary: 0,
    }
    state.riders.push(newRider)
    store.riderAccounts.push({
      role: 'rider',
      username,
      password,
      profile: {
        rider: newRider,
        walletBalance: 0,
        pendingOrders: [],
        historyOrders: [],
      },
    })
  }

  return { ok: true as const }
}

function pushOrderToMerchantStores(order: Order) {
  for (const account of state.accountStore.merchantAccounts) {
    for (const store of account.profile.stores) {
      if (store.merchant.id === order.merchantId) {
        const isHistory = order.status === '已完成' || order.status === '已取消'
        if (isHistory) {
          store.historyOrders.unshift(deepClone(order))
        } else {
          store.pendingOrders.unshift(deepClone(order))
        }
      }
    }
  }
}

export function checkoutCustomer(
  username: string,
  lines: { merchantId: string; productId: string; quantity: number }[],
) {
  const account = state.accountStore.customerAccounts.find((item) => item.username === username)
  if (!account) return { ok: false as const, message: '未找到顾客账号' }

  if (lines.length === 0) return { ok: false as const, message: '购物车为空' }

  const grouped = new Map<string, { merchantId: string; productId: string; quantity: number }[]>()
  for (const line of lines) {
    const list = grouped.get(line.merchantId) ?? []
    list.push(line)
    grouped.set(line.merchantId, list)
  }

  let cartTotal = 0
  const createdOrders: Order[] = []
  const now = new Date()
  const orderTimeText = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  let index = 0
  for (const [merchantId, groupLines] of grouped) {
    const items: OrderItem[] = []
    for (const line of groupLines) {
      const product = state.catalogProducts.find((p) => p.id === line.productId && p.merchantId === merchantId)
      if (!product) continue
      items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: line.quantity,
      })
      cartTotal += product.price * line.quantity
    }
    if (items.length === 0) continue

    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const order: Order = {
      id: `o-${Date.now()}-${index + 1}`,
      customerId: account.profile.id,
      merchantId,
      items,
      totalAmount,
      deliveryAddress: account.profile.defaultAddress,
      status: '制作中',
      placedAt: orderTimeText,
    }
    createdOrders.push(order)
    index += 1
  }

  if (createdOrders.length === 0) {
    return { ok: false as const, message: '无法解析购物车商品' }
  }

  const recomputedTotal = createdOrders.reduce((s, o) => s + o.totalAmount, 0)
  if (account.profile.walletBalance < recomputedTotal) {
    return { ok: false as const, message: '余额不足' }
  }

  account.profile.walletBalance -= recomputedTotal
  account.profile.pendingOrders = [...createdOrders.map((o) => deepClone(o)), ...account.profile.pendingOrders]
  state.orders.push(...createdOrders.map((o) => deepClone(o)))

  for (const order of createdOrders) {
    pushOrderToMerchantStores(order)
  }

  return {
    ok: true as const,
    orders: createdOrders,
    walletBalance: account.profile.walletBalance,
  }
}

export function patchCustomerProfile(
  username: string,
  patch: Partial<Pick<CustomerProfile, 'walletBalance' | 'defaultAddress' | 'name' | 'phone'>>,
) {
  const account = state.accountStore.customerAccounts.find((item) => item.username === username)
  if (!account) return { ok: false as const }
  if (patch.walletBalance !== undefined) account.profile.walletBalance = patch.walletBalance
  if (patch.defaultAddress !== undefined) account.profile.defaultAddress = patch.defaultAddress
  if (patch.name !== undefined) account.profile.name = patch.name
  if (patch.phone !== undefined) account.profile.phone = patch.phone
  return { ok: true as const }
}

export function replaceMerchantProfile(username: string, profile: MerchantProfile) {
  const account = state.accountStore.merchantAccounts.find((item) => item.username === username)
  if (!account) return { ok: false as const }
  account.profile = deepClone(profile)
  return { ok: true as const }
}

export function createMerchantStore(username: string, storeName: string, address: string) {
  const account = state.accountStore.merchantAccounts.find((item) => item.username === username)
  if (!account) return { ok: false as const, message: '未找到商家账号' }
  const createdMerchant: Merchant = {
    id: `m-local-${Date.now()}`,
    storeName,
    category: '中餐',
    address,
    phone: account.profile.phone || '',
    rating: 5,
    tags: ['新店'],
    featuredProductIds: [],
  }
  const createdStore: MerchantStoreProfile = {
    merchant: createdMerchant,
    products: [],
    pendingOrders: [],
    historyOrders: [],
  }
  account.profile.stores.push(createdStore)
  return { ok: true as const, merchantId: createdMerchant.id }
}
