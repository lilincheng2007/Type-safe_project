package delivery.user.objects

/** 收货用联系人信息组（可多组，一组内为默认） */
final case class CustomerDeliveryContact(
    id: String,
    name: String,
    phone: String,
    address: String,
    isDefault: Boolean
)
