package delivery.model

/** 与前端 domain-types / API JSON 字段一一对应的不可变模型 */

final case class Voucher(
    id: String,
    title: String,
    discountAmount: Double,
    minSpend: Double,
    expiresAt: String,
    remainingCount: Int
)

final case class OrderItem(
    productId: String,
    name: String,
    unitPrice: Double,
    quantity: Int
)

final case class Order(
    id: String,
    customerId: String,
    merchantId: String,
    riderId: Option[String],
    items: List[OrderItem],
    totalAmount: Double,
    deliveryAddress: String,
    status: String,
    placedAt: String
)

final case class Customer(
    id: String,
    name: String,
    phone: String,
    defaultAddress: String,
    walletBalance: Double,
    orderHistoryIds: List[String],
    vouchers: List[Voucher]
)

final case class Product(
    id: String,
    merchantId: String,
    name: String,
    price: Double,
    description: String,
    imageUrl: String,
    monthlySales: Int,
    inventoryStatus: String,
    discountText: Option[String] = None
)

final case class Merchant(
    id: String,
    storeName: String,
    category: String,
    address: String,
    phone: String,
    rating: Double,
    tags: List[String],
    featuredProductIds: List[String]
)

final case class Rider(
    id: String,
    name: String,
    phone: String,
    realtimeLocation: String,
    status: String,
    totalOrders: Int,
    rating: Double,
    station: String,
    salary: Double
)

final case class CustomerServiceAgent(
    id: String,
    name: String,
    department: String,
    channel: String,
    ticketIds: List[String]
)

final case class OperationsManager(
    id: String,
    name: String,
    region: String,
    managedMerchantIds: List[String],
    campaignPlans: List[String]
)

final case class MerchantApplication(
    id: String,
    applicantName: String,
    storeName: String,
    category: String,
    region: String,
    status: String
)

final case class ComplaintTicket(
    id: String,
    orderId: String,
    customerName: String,
    summary: String,
    severity: String,
    status: String
)

final case class PromotionCampaign(
    id: String,
    title: String,
    target: String,
    status: String
)

final case class CustomerProfile(
    id: String,
    name: String,
    phone: String,
    defaultAddress: String,
    vouchers: List[Voucher],
    walletBalance: Double,
    pendingOrders: List[Order],
    historyOrders: List[Order]
)

final case class MerchantStoreProfile(
    merchant: Merchant,
    products: List[Product],
    pendingOrders: List[Order],
    historyOrders: List[Order]
)

final case class MerchantProfile(
    id: String,
    ownerName: String,
    phone: String,
    stores: List[MerchantStoreProfile]
)

final case class RiderProfile(
    rider: Rider,
    walletBalance: Double,
    pendingOrders: List[Order],
    historyOrders: List[Order]
)

final case class CustomerAccount(
    role: String,
    username: String,
    password: String,
    profile: CustomerProfile
)

final case class MerchantAccount(
    role: String,
    username: String,
    password: String,
    profile: MerchantProfile
)

final case class RiderAccount(
    role: String,
    username: String,
    password: String,
    profile: RiderProfile
)

final case class AdminAccount(
    role: String,
    username: String,
    password: String,
    displayName: String
)

final case class AccountStore(
    customerAccounts: List[CustomerAccount],
    merchantAccounts: List[MerchantAccount],
    riderAccounts: List[RiderAccount],
    adminAccounts: List[AdminAccount]
)

final case class AppState(
    customers: List[Customer],
    catalogMerchants: List[Merchant],
    catalogProducts: List[Product],
    riders: List[Rider],
    orders: List[Order],
    accountStore: AccountStore,
    serviceAgents: List[CustomerServiceAgent],
    operationsManagers: List[OperationsManager],
    merchantApplications: List[MerchantApplication],
    complaintTickets: List[ComplaintTicket],
    campaigns: List[PromotionCampaign]
)

// 请求/响应 DTO
final case class LoginRequest(role: String, username: String, password: String)
final case class RegisterRequest(role: String, username: String, password: String)
final case class LoginResponse(token: String, username: String, role: String)
final case class OkResponse(ok: Boolean)
final case class CheckoutLine(merchantId: String, productId: String, quantity: Int)
final case class CheckoutRequest(lines: List[CheckoutLine])
final case class CheckoutResponse(orders: List[Order], walletBalance: Double)
final case class CustomerProfilePatch(
    walletBalance: Option[Double] = None,
    defaultAddress: Option[String] = None,
    name: Option[String] = None,
    phone: Option[String] = None
)
final case class MerchantProfileBody(profile: MerchantProfile)
final case class CreateStoreRequest(storeName: String, address: String)
final case class CreateStoreResponse(ok: Boolean, merchantId: String)

final case class CustomerAccountPublic(role: String, username: String, profile: CustomerProfile)
final case class MerchantAccountPublic(role: String, username: String, profile: MerchantProfile)
final case class RiderAccountPublic(role: String, username: String, profile: RiderProfile)
final case class AdminAccountPublic(role: String, username: String, displayName: String)

final case class CatalogResponse(merchants: List[Merchant], products: List[Product])
final case class OverviewResponse(
    merchants: List[Merchant],
    orders: List[Order],
    riders: List[Rider],
    campaigns: List[PromotionCampaign],
    complaintTickets: List[ComplaintTicket]
)
final case class OrdersPanelResponse(orders: List[Order], riders: List[Rider])
final case class PlatformMetaResponse(
    campaigns: List[PromotionCampaign],
    complaintTickets: List[ComplaintTicket],
    merchantApplications: List[MerchantApplication],
    serviceAgents: List[CustomerServiceAgent],
    operationsManagers: List[OperationsManager]
)

final case class ErrorBody(error: String)
