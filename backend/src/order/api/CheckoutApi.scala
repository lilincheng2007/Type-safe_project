package delivery.order.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.http.support.AuthHttp
import delivery.order.objects.{CheckoutLine, CheckoutRequest, CheckoutResponse}
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.{DeliveryState, ErrorBody}
import delivery.store.{MerchantDomainOps, OrderDomainOps, UserDomainOps}
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object CheckoutApi:

  private def toLegacyLine(line: CheckoutLine): delivery.model.CheckoutLine =
    delivery.model.CheckoutLine(line.merchantId, line.productId, line.quantity)

  def routes(ref: Ref[IO, DeliveryState], persist: DeliveryState => IO[Unit]): HttpRoutes[IO] =
    HttpRoutes.of[IO] {
      case req @ POST -> Root / "api" / "delivery" / "me" / "customer" / "checkout" =>
        AuthHttp.requireRole(req, "customer") { username =>
          for
            body <- req.as[CheckoutRequest]
            current <- ref.get
            resp <- current.user.customerAccounts.find(_.username == username) match
              case None =>
                NotFound(ErrorBody("未找到顾客"))
              case Some(account) =>
                OrderDomainOps.buildOrdersForCheckout(
                  current.merchant.catalogProducts,
                  account.profile,
                  body.lines.map(toLegacyLine)
                ) match
                  case Left(msg) => BadRequest(ErrorBody(msg))
                  case Right((orders, totalDebit)) =>
                    UserDomainOps.checkoutComplete(current.user, delivery.model.CheckoutCompleteRequest(username, orders, totalDebit)) match
                      case Left(msg) => BadRequest(ErrorBody(msg))
                      case Right(nextUser) =>
                        val nextOrder = OrderDomainOps.appendOrders(current.order, orders)
                        val nextMerchant = MerchantDomainOps.attachOrders(current.merchant, orders)
                        val next = current.copy(user = nextUser, order = nextOrder, merchant = nextMerchant)
                        val wallet = nextUser.customerAccounts.find(_.username == username).map(_.profile.walletBalance).getOrElse(0d)
                        ref.set(next) *> persist(next) *> Ok(CheckoutResponse(orders = orders, walletBalance = wallet))
          yield resp
        }
    }

end CheckoutApi
