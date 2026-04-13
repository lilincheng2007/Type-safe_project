package delivery.order.service

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.order.objects.{CheckoutRequest, CheckoutResponse}
import delivery.order.repository.OrderRepository
import delivery.order.utils.OrderApiSupport
import delivery.shared.objects.DeliveryState
import delivery.store.{MerchantDomainOps, OrderDomainOps, UserDomainOps}

object OrderService:

  enum CheckoutFailure:
    case CustomerMissing
    case Invalid(msg: String)

  def checkout(
      ref: Ref[IO, DeliveryState],
      persist: DeliveryState => IO[Unit],
      username: String,
      body: CheckoutRequest
  ): IO[Either[CheckoutFailure, CheckoutResponse]] =
    for
      current <- ref.get
      resp <- current.user.customerAccounts.find(_.username == username) match
        case None => IO.pure(Left(CheckoutFailure.CustomerMissing))
        case Some(account) =>
          OrderDomainOps.buildOrdersForCheckout(
            current.merchant.catalogProducts,
            account.profile,
            body.lines.map(OrderApiSupport.toLegacyLine)
          ).flatMap {
            case Left(msg) => IO.pure(Left(CheckoutFailure.Invalid(msg)))
            case Right((orders, totalDebit)) =>
              UserDomainOps.checkoutComplete(current.user, delivery.model.CheckoutCompleteRequest(username, orders, totalDebit)) match
                case Left(msg) => IO.pure(Left(CheckoutFailure.Invalid(msg)))
                case Right(nextUser) =>
                  val nextOrder = OrderDomainOps.appendOrders(current.order, orders)
                  val nextMerchant = MerchantDomainOps.attachOrders(current.merchant, orders)
                  val next = OrderRepository.withOrderAndMerchantAndUserState(current, nextUser, nextOrder, nextMerchant)
                  val wallet = nextUser.customerAccounts.find(_.username == username).map(_.profile.walletBalance).getOrElse(0d)
                  ref.set(next) *> persist(next) *> IO.pure(Right(CheckoutResponse(orders = orders, walletBalance = wallet)))
          }
    yield resp

end OrderService
