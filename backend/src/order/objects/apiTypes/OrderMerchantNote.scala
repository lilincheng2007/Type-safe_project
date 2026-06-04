package delivery.order.objects.apiTypes

import delivery.shared.objects.MerchantId

final case class OrderMerchantNote(
    merchantId: MerchantId,
    text: Option[String] = None,
    imageUrl: Option[String] = None
)
