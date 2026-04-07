package delivery.model

/** 与前端 `frontend/src/delivery/model/api.ts` 对齐 */

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
