package delivery.admin.state

final case class AdminAccount(
    role: String,
    username: String,
    password: String,
    displayName: String
)
