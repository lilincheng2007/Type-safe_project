package delivery.user.services

import delivery.domain.UserRole
import delivery.user.objects.CustomerAccountPublic
import delivery.user.objects.apiTypes.CustomerMeResponse
import delivery.user.tables.CustomerAccountRecord

object CustomerMeResponseAssembler:

  def assemble(username: String, account: CustomerAccountRecord): CustomerMeResponse =
    CustomerMeResponse(
      username = username,
      role = UserRole.customer,
      customerAccount = CustomerAccountPublic(UserRole.customer, account.username, account.profile)
    )

end CustomerMeResponseAssembler
