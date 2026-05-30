package delivery.order.objects

import delivery.shared.objects.{MerchantId, ProductId}

final case class CheckoutLine(merchantId: MerchantId, productId: ProductId, quantity: Int)
