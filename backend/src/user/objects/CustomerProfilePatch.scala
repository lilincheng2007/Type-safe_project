package delivery.user.objects

final case class CustomerProfilePatch(
    walletBalance: Option[Double] = None,
    defaultAddress: Option[String] = None,
    name: Option[String] = None,
    phone: Option[String] = None
)
