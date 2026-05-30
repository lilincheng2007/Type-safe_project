package delivery.user.objects

final case class CustomerProfilePatch(
    defaultAddress: Option[String] = None,
    name: Option[String] = None,
    phone: Option[String] = None,
    deliveryContacts: Option[List[CustomerDeliveryContact]] = None
)
