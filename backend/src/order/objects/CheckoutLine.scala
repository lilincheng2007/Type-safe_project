package delivery.order.objects

final case class CheckoutLine(merchantId: String, productId: String, quantity: Int)
