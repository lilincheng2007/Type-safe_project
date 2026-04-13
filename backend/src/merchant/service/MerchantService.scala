package delivery.merchant.service

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.merchant.objects.{CatalogResponse, CreateStoreRequest, CreateStoreResponse, MerchantMeResponse, MerchantProfileBody}
import delivery.merchant.repository.MerchantRepository
import delivery.merchant.utils.MerchantApiSupport
import delivery.shared.objects.{DeliveryState, OkResponse}
import delivery.store.MerchantDomainOps

object MerchantService:

  def fetchCatalog(ref: Ref[IO, DeliveryState]): IO[CatalogResponse] =
    ref.get.map(state => CatalogResponse(state.merchant.catalogMerchants, state.merchant.catalogProducts))

  def fetchMerchantMe(ref: Ref[IO, DeliveryState], username: String): IO[Option[MerchantMeResponse]] =
    ref.get.map { state =>
      MerchantRepository.findMerchantAccount(state, username).map(account => MerchantApiSupport.merchantMeResponse(username, account))
    }

  def replaceProfile(
      ref: Ref[IO, DeliveryState],
      persist: DeliveryState => IO[Unit],
      username: String,
      body: MerchantProfileBody
  ): IO[Either[String, OkResponse]] =
    for
      current <- ref.get
      resp <- MerchantDomainOps.replaceMerchantProfile(current.merchant, username, body.profile) match
        case Left(msg) => IO.pure(Left(msg))
        case Right(nextMerchant) =>
          val next = MerchantRepository.withMerchantState(current, nextMerchant)
          ref.set(next) *> persist(next) *> IO.pure(Right(OkResponse(ok = true)))
    yield resp

  def createStore(
      ref: Ref[IO, DeliveryState],
      persist: DeliveryState => IO[Unit],
      username: String,
      body: CreateStoreRequest
  ): IO[Either[String, CreateStoreResponse]] =
    for
      current <- ref.get
      resp <- MerchantDomainOps.createMerchantStore(current.merchant, username, body.storeName, body.address).flatMap {
        case Left(msg) => IO.pure(Left(msg))
        case Right((nextMerchant, merchantId)) =>
          val next = MerchantRepository.withMerchantState(current, nextMerchant)
          ref.set(next) *> persist(next) *> IO.pure(Right(CreateStoreResponse(ok = true, merchantId = merchantId)))
      }
    yield resp

end MerchantService
