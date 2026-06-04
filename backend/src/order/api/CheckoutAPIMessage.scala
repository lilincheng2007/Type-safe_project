package delivery.order.api

import cats.effect.IO
import cats.syntax.all.*
import delivery.merchant.tables.catalogproduct.CatalogProductTable
import delivery.order.objects.{CheckoutLine}
import delivery.order.objects.apiTypes.{CheckoutRequest, CheckoutResponse, OrderMerchantNote}
import delivery.order.tables.checkoutrequest.CheckoutRequestTable
import delivery.order.tables.order.OrderTable
import delivery.order.utils.OrderApiSupport
import delivery.shared.api.{APIWithRoleMessage, HttpApiError}
import delivery.shared.objects.VoucherId
import delivery.user.tables.customerprofile.CustomerProfileTable

import java.sql.Connection

final case class CheckoutAPIMessage(
    lines: List[CheckoutLine],
    customerName: Option[String],
    customerPhone: Option[String],
    deliveryAddress: Option[String],
    voucherId: Option[VoucherId],
    merchantNotes: List[OrderMerchantNote] = Nil
) extends APIWithRoleMessage[CheckoutResponse]:
  override def plan(connection: Connection, username: String): IO[CheckoutResponse] =
    val body = CheckoutRequest(lines, customerName, customerPhone, deliveryAddress, voucherId, merchantNotes)
    for
      account <- CustomerProfileTable.findByUsername(connection, username).flatMap {
        case Some(value) => IO.pure(value)
        case None        => IO.raiseError(HttpApiError.NotFound(OrderApiSupport.customerNotFound.error))
      }
      products <- CatalogProductTable.list(connection)
      profileForOrders =
        (body.customerName, body.customerPhone, body.deliveryAddress) match
          case (Some(n), Some(ph), Some(ad))
              if n.trim.nonEmpty && ph.trim.nonEmpty && ad.trim.nonEmpty =>
            account.profile.copy(name = n.trim, phone = ph.trim, defaultAddress = ad.trim)
          case _ => account.profile
      built <- OrderAPIMessageSupport.buildOrdersForCheckout(products, profileForOrders, body.lines.map(OrderApiSupport.normalizeLine), body.voucherId, body.merchantNotes)
      result <- built match
        case Left(msg) => IO.raiseError(HttpApiError.BadRequest(msg))
        case Right(checkout) =>
          val nextVouchers = checkout.usedVoucher.map(voucher => OrderAPIMessageSupport.consumeVoucher(account.profile, voucher)).getOrElse(account.profile.vouchers)
          val nextAccount = account.copy(profile =
            account.profile.copy(
              walletBalance = OrderAPIMessageSupport.roundMoney(account.profile.walletBalance - checkout.payableAmount),
              pendingOrders = checkout.orders.reverse ::: account.profile.pendingOrders,
              vouchers = nextVouchers
            )
          )
          for
            _ <- checkout.orders.traverse_(OrderTable.upsert(connection, _))
            _ <- CheckoutRequestTable.insert(connection, username, body, checkout.orders.map(_.id))
            _ <- CustomerProfileTable.upsert(connection, nextAccount)
          yield CheckoutResponse(
            orders = checkout.orders,
            walletBalance = nextAccount.profile.walletBalance,
            originalAmount = checkout.originalAmount,
            discountAmount = checkout.discountAmount,
            payableAmount = checkout.payableAmount,
            usedVoucher = checkout.usedVoucher
          )
    yield result
