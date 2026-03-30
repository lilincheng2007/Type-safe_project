import type { Customer, Merchant, Order, Product, Rider, UserRole, Voucher } from '@/domain-types'
import { customers, merchants, orders, products, riders } from '@/lib/delivery-data'

type RegisterableRole = Exclude<UserRole, 'admin'>

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

const STORE_KEY = 'delivery-platform-account-store-v1'

function splitOrdersByHistory(sourceOrders: Order[]) {
  const pending = sourceOrders.filter((item) => item.status !== '已完成' && item.status !== '已取消')
  const history = sourceOrders.filter((item) => item.status === '已完成' || item.status === '已取消')
  return { pending, history }
}

function normalizeProduct(product: Product): Product {
  const inventoryCount =
    typeof product.inventoryCount === 'number' && Number.isFinite(product.inventoryCount)
      ? product.inventoryCount
      : product.inventoryStatus === '售罄'
        ? 0
        : product.inventoryStatus === '紧张'
          ? 8
          : 24

  return {
    ...product,
    inventoryCount,
    shelfStatus: product.shelfStatus ?? '上架',
  }
}

function normalizeAccountStore(store: AccountStore): AccountStore {
  return {
    ...store,
    merchantAccounts: store.merchantAccounts.map((account) => ({
      ...account,
      profile: {
        ...account.profile,
        stores: account.profile.stores.map((storeItem) => ({
          ...storeItem,
          products: storeItem.products.map(normalizeProduct),
        })),
      },
    })),
  }
}

function buildSeedStore(): AccountStore {
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
        vouchers: customer.vouchers,
        walletBalance: customer.walletBalance,
        pendingOrders: pending,
        historyOrders: history,
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
            merchant,
            products: products.filter((product) => product.merchantId === merchant.id),
            pendingOrders: pending,
            historyOrders: history,
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
        rider,
        walletBalance: Math.round(rider.salary * 0.1),
        pendingOrders: pending,
        historyOrders: history,
      },
    }
  })

  const adminAccounts: AdminAccount[] = [
    {
      role: 'admin',
      username: 'admin',
      password: '123456',
      displayName: '平台管理员',
    },
  ]

  return {
    customerAccounts,
    merchantAccounts,
    riderAccounts,
    adminAccounts,
  }
}

function saveStore(store: AccountStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

function isAccountStore(value: unknown): value is AccountStore {
  if (!value || typeof value !== 'object') {
    return false
  }
  const record = value as Record<string, unknown>
  return (
    Array.isArray(record.customerAccounts) &&
    Array.isArray(record.merchantAccounts) &&
    Array.isArray(record.riderAccounts) &&
    Array.isArray(record.adminAccounts)
  )
}

export function getAccountStore(): AccountStore {
  const raw = localStorage.getItem(STORE_KEY)
  if (!raw) {
    const seeded = buildSeedStore()
    saveStore(seeded)
    return seeded
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (isAccountStore(parsed)) {
      const normalized = normalizeAccountStore(parsed)
      if (JSON.stringify(normalized) !== JSON.stringify(parsed)) {
        saveStore(normalized)
      }
      return normalized
    }
  } catch {
    // fall through to reseed
  }

  const seeded = buildSeedStore()
  saveStore(seeded)
  return seeded
}

type LoginResult =
  | { ok: true }
  | { ok: false; reason: 'not-found' | 'wrong-password' }

function findPasswordByRole(store: AccountStore, role: UserRole, username: string): string | null {
  if (role === 'customer') {
    return store.customerAccounts.find((item) => item.username === username)?.password ?? null
  }
  if (role === 'merchant') {
    return store.merchantAccounts.find((item) => item.username === username)?.password ?? null
  }
  if (role === 'rider') {
    return store.riderAccounts.find((item) => item.username === username)?.password ?? null
  }
  return store.adminAccounts.find((item) => item.username === username)?.password ?? null
}

export function verifyLogin(role: UserRole, username: string, password: string): LoginResult {
  const store = getAccountStore()
  const matchedPassword = findPasswordByRole(store, role, username)
  if (matchedPassword === null) {
    return { ok: false, reason: 'not-found' }
  }
  if (matchedPassword !== password) {
    return { ok: false, reason: 'wrong-password' }
  }
  return { ok: true }
}

export function registerAccount(role: RegisterableRole, username: string, password: string) {
  const store = getAccountStore()
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

  saveStore(store)
  return { ok: true as const }
}

export function getCustomerAccountByUsername(username: string) {
  return getAccountStore().customerAccounts.find((item) => item.username === username) ?? null
}

export function getMerchantAccountByUsername(username: string) {
  return getAccountStore().merchantAccounts.find((item) => item.username === username) ?? null
}

export function getRiderAccountByUsername(username: string) {
  return getAccountStore().riderAccounts.find((item) => item.username === username) ?? null
}

export function updateCustomerAccountProfile(username: string, updater: (profile: CustomerProfile) => CustomerProfile) {
  const store = getAccountStore()
  const account = store.customerAccounts.find((item) => item.username === username)
  if (!account) {
    return
  }
  account.profile = updater(account.profile)
  saveStore(store)
}

export function updateMerchantAccountProfile(username: string, updater: (profile: MerchantProfile) => MerchantProfile) {
  const store = getAccountStore()
  const account = store.merchantAccounts.find((item) => item.username === username)
  if (!account) {
    return
  }
  account.profile = updater(account.profile)
  saveStore(store)
}
