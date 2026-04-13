package delivery.store

import cats.effect.IO
import delivery.model.*

object OrderDomainOps:

  /** 基于商品目录与顾客资料生成订单（不写库）。 */
  def buildOrdersForCheckout(
      products: List[Product],
      customerProfile: CustomerProfile,
      lines: List[CheckoutLine]
  ): IO[Either[String, (List[Order], Double)]] =
    if lines.isEmpty then
      IO.pure(Left("购物车为空"))
    else
      for
        nowMillis <- IO.realTime.map(_.toMillis)
        zoneId <- IO.delay(java.time.ZoneId.systemDefault())
      yield
        val grouped = lines.groupBy(_.merchantId)
        val now = java.time.Instant.ofEpochMilli(nowMillis).atZone(zoneId).toLocalDateTime
        val orderTimeText =
          f"${now.getYear}%04d-${now.getMonthValue}%02d-${now.getDayOfMonth}%02d ${now.getHour}%02d:${now.getMinute}%02d"

        val createdOrders = grouped.toList.zipWithIndex.flatMap { case ((merchantId, groupLines), idx) =>
          val items = groupLines.flatMap { line =>
            products.find(p => p.id == line.productId && p.merchantId == merchantId).map { p =>
              OrderItem(p.id, p.name, p.price, line.quantity)
            }
          }
          if items.isEmpty then None
          else
            val totalAmount = items.map(i => i.unitPrice * i.quantity).sum
            val order = Order(
              id = s"o-$nowMillis-${idx + 1}",
              customerId = customerProfile.id,
              merchantId = merchantId,
              riderId = None,
              items = items,
              totalAmount = totalAmount,
              deliveryAddress = customerProfile.defaultAddress,
              status = "制作中",
              placedAt = orderTimeText
            )
            Some(order)
        }

        if createdOrders.isEmpty then Left("无法解析购物车商品")
        else
          val total = createdOrders.map(_.totalAmount).sum
          if customerProfile.walletBalance < total then Left("余额不足")
          else Right((createdOrders.reverse, total))

  def appendOrders(state: OrderServiceState, newOnes: List[Order]): OrderServiceState =
    state.copy(orders = newOnes.reverse ::: state.orders)

end OrderDomainOps
