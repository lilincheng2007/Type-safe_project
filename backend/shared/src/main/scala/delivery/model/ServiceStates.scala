package delivery.model

/** 各微服务独立持久化的 JSONB 快照形态（每服务一库）。 */

final case class AuthCredential(role: String, username: String, password: String)

final case class UserServiceState(
    customers: List[Customer],
    customerAccounts: List[CustomerAccount],
    authCredentials: List[AuthCredential]
)

final case class MerchantServiceState(
    merchantAccounts: List[MerchantAccount],
    catalogMerchants: List[Merchant],
    catalogProducts: List[Product]
)

final case class RiderServiceState(
    riders: List[Rider],
    riderAccounts: List[RiderAccount]
)

final case class AdminServiceState(
    adminAccounts: List[AdminAccount],
    serviceAgents: List[CustomerServiceAgent],
    operationsManagers: List[OperationsManager],
    merchantApplications: List[MerchantApplication],
    complaintTickets: List[ComplaintTicket],
    campaigns: List[PromotionCampaign]
)

final case class OrderServiceState(
    orders: List[Order]
)

/** 订单服务调用用户服务完成扣款与顾客侧订单挂载。 */
final case class CheckoutCompleteRequest(username: String, orders: List[Order], totalDebit: Double)

/** 商户服务挂载新订单到对应门店。 */
final case class AttachOrdersRequest(orders: List[Order])

final case class BootstrapUserRequest(username: String)

final case class OrderBatch(orders: List[Order])

final case class RiderAdminExport(riders: List[Rider])
