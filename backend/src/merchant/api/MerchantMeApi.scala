package delivery.merchant.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.merchant.objects.MerchantMeResponse
import delivery.merchant.service.MerchantService
import delivery.shared.objects.DeliveryState

object MerchantMeApi extends ApiPlan[MerchantMeApi.MerchantMeQuery, Option[MerchantMeResponse]]:

  final case class MerchantMeQuery(ref: Ref[IO, DeliveryState], username: String)

  override val name: String = "MerchantMeApi"

  override def plan(input: MerchantMeApi.MerchantMeQuery): IO[Option[MerchantMeResponse]] =
    MerchantService.fetchMerchantMe(input.ref, input.username)

end MerchantMeApi
