package delivery.merchant.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.merchant.objects.{CreateStoreRequest, CreateStoreResponse}
import delivery.merchant.service.MerchantService
import delivery.shared.objects.DeliveryState

object MerchantStoreApi extends ApiPlan[MerchantStoreApi.MerchantStoreCommand, Either[String, CreateStoreResponse]]:

  final case class MerchantStoreCommand(
      ref: Ref[IO, DeliveryState],
      persist: DeliveryState => IO[Unit],
      username: String,
      body: CreateStoreRequest
  )

  override val name: String = "MerchantStoreApi"

  override def plan(input: MerchantStoreApi.MerchantStoreCommand): IO[Either[String, CreateStoreResponse]] =
    MerchantService.createStore(input.ref, input.persist, input.username, input.body)

end MerchantStoreApi
