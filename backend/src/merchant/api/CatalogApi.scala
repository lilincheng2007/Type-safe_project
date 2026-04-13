package delivery.merchant.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.merchant.objects.CatalogResponse
import delivery.merchant.service.MerchantService
import delivery.shared.objects.DeliveryState

object CatalogApi extends ApiPlan[CatalogApi.CatalogQuery, CatalogResponse]:

  final case class CatalogQuery(ref: Ref[IO, DeliveryState])

  override val name: String = "CatalogApi"

  override def plan(input: CatalogApi.CatalogQuery): IO[CatalogResponse] =
    MerchantService.fetchCatalog(input.ref)

end CatalogApi
