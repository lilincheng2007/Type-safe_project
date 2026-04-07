package delivery.model

/** 与前端 `frontend/src/delivery/model/accounts.ts` 对齐 */

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
