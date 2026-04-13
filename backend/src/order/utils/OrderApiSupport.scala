package delivery.order.utils

import delivery.order.objects.CheckoutLine
import delivery.shared.objects.ErrorBody

object OrderApiSupport:

  def toLegacyLine(line: CheckoutLine): delivery.model.CheckoutLine =
    delivery.model.CheckoutLine(line.merchantId, line.productId, line.quantity)

  def customerNotFound: ErrorBody = ErrorBody("未找到顾客")

end OrderApiSupport
