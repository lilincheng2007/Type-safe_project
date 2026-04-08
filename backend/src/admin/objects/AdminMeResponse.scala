package delivery.admin.objects

final case class AdminMeResponse(
    username: String,
    role: String,
    adminAccount: AdminAccountPublic
)
