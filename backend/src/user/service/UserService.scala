package delivery.user.service

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.auth.JwtSupport
import delivery.shared.objects.{DeliveryState, OkResponse}
import delivery.store.{MerchantDomainOps, RiderDomainOps, UserDomainOps}
import delivery.user.objects.{CustomerMeResponse, CustomerProfilePatch, LoginRequest, LoginResponse, RegisterRequest}
import delivery.user.repository.UserRepository
import delivery.user.utils.UserApiSupport

object UserService:

  def login(ref: Ref[IO, DeliveryState], body: LoginRequest): IO[Either[String, LoginResponse]] =
    ref.get.flatMap { state =>
      UserDomainOps.verifyLogin(state.user, body.role, body.username, body.password) match
        case Left(msg) => IO.pure(Left(msg))
        case Right(_) =>
          JwtSupport.signToken(body.username, body.role).map { token =>
            Right(LoginResponse(token, body.username, body.role))
          }
    }

  def fetchCustomerMe(ref: Ref[IO, DeliveryState], username: String): IO[Option[CustomerMeResponse]] =
    ref.get.map { state =>
      UserRepository.findCustomerAccount(state, username).map(account => UserApiSupport.customerMeResponse(username, account))
    }

  def patchCustomerProfile(
      ref: Ref[IO, DeliveryState],
      persist: DeliveryState => IO[Unit],
      username: String,
      patch: CustomerProfilePatch
  ): IO[Either[String, OkResponse]] =
    for
      current <- ref.get
      result = UserDomainOps.patchCustomer(
        current.user,
        username,
        delivery.model.CustomerProfilePatch(
          walletBalance = patch.walletBalance,
          defaultAddress = patch.defaultAddress,
          name = patch.name,
          phone = patch.phone
        )
      )
      resp <- result match
        case Left(msg) => IO.pure(Left(msg))
        case Right(nextUser) =>
          val next = UserRepository.withUserState(current, nextUser)
          ref.set(next) *> persist(next) *> IO.pure(Right(OkResponse(ok = true)))
    yield resp

  def register(
      ref: Ref[IO, DeliveryState],
      persist: DeliveryState => IO[Unit],
      body: RegisterRequest
  ): IO[Either[String, OkResponse]] =
    for
      current <- ref.get
      resp <- body.role match
        case "admin" => IO.pure(Left("不可注册管理员"))
        case "customer" =>
          UserDomainOps.registerCustomer(current.user, body.username, body.password).flatMap {
            case Left(msg) => IO.pure(Left(msg))
            case Right(nextUser) =>
              val next = UserRepository.withUserState(current, nextUser)
              ref.set(next) *> persist(next) *> IO.pure(Right(OkResponse(ok = true)))
          }
        case "merchant" =>
          UserDomainOps.registerMerchantCredential(current.user, body.username, body.password) match
            case Left(msg) => IO.pure(Left(msg))
            case Right(nextUser) =>
              MerchantDomainOps.bootstrapMerchant(current.merchant, body.username).flatMap {
                case Left(msg) => IO.pure(Left(msg))
                case Right(nextMerchant) =>
                  val next = UserRepository.withUserAndMerchantState(current, nextUser, nextMerchant)
                  ref.set(next) *> persist(next) *> IO.pure(Right(OkResponse(ok = true)))
              }
        case "rider" =>
          UserDomainOps.registerRiderCredential(current.user, body.username, body.password) match
            case Left(msg) => IO.pure(Left(msg))
            case Right(nextUser) =>
              RiderDomainOps.bootstrapRider(current.rider, body.username).flatMap {
                case Left(msg) => IO.pure(Left(msg))
                case Right(nextRider) =>
                  val next = UserRepository.withUserAndRiderState(current, nextUser, nextRider)
                  ref.set(next) *> persist(next) *> IO.pure(Right(OkResponse(ok = true)))
              }
        case _ => IO.pure(Left(UserApiSupport.invalidRole.error))
    yield resp

end UserService
