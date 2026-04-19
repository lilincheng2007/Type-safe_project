package delivery.order.utils

import delivery.order.objects.{CheckoutLine, Order}
import delivery.shared.objects.ErrorBody

object OrderApiSupport:

  def normalizeLine(line: CheckoutLine): CheckoutLine =
    line

  def customerNotFound: ErrorBody = ErrorBody("未找到顾客")

end OrderApiSupport
