package delivery.merchant.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.merchant.objects.MerchantProfileBody
import delivery.merchant.service.MerchantService
import delivery.shared.objects.{DeliveryState, OkResponse}

object MerchantProfileApi extends ApiPlan[MerchantProfileApi.MerchantProfileCommand, Either[String, OkResponse]]:

  final case class MerchantProfileCommand(
      ref: Ref[IO, DeliveryState],
      persist: DeliveryState => IO[Unit],
      username: String,
      body: MerchantProfileBody
  )

  override val name: String = "MerchantProfileApi"

  override def plan(input: MerchantProfileApi.MerchantProfileCommand): IO[Either[String, OkResponse]] =
    MerchantService.replaceProfile(input.ref, input.persist, input.username, input.body)

end MerchantProfileApi
