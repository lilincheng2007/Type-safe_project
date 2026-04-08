package delivery.user.objects

final case class CustomerMeResponse(
    username: String,
    role: String,
    customerAccount: CustomerAccountPublic
)
