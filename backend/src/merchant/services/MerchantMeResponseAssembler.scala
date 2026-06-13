package delivery.merchant.services

import delivery.merchant.objects.MerchantAccountPublic
import delivery.merchant.objects.apiTypes.MerchantMeResponse
import delivery.merchant.tables.MerchantAccountRecord
import delivery.domain.UserRole

object MerchantMeResponseAssembler:

  def assemble(username: String, account: MerchantAccountRecord): MerchantMeResponse =
    MerchantMeResponse(
      username = username,
      role = UserRole.merchant,
      merchantAccount = MerchantAccountPublic(UserRole.merchant, account.username, account.profile)
    )

end MerchantMeResponseAssembler
