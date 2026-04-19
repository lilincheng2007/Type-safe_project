package delivery.merchant.api

import cats.effect.IO
import delivery.shared.api.ApiPlan
import delivery.merchant.objects.CatalogResponse
import delivery.shared.objects.DeliveryState
import org.typelevel.log4cats.slf4j.Slf4jLogger

object CatalogApi extends ApiPlan[CatalogApi.CatalogQuery, CatalogResponse]:

  final case class CatalogQuery(state: DeliveryState)

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "CatalogApi"

  override def plan(input: CatalogApi.CatalogQuery): IO[CatalogResponse] =
    for
      _ <- logger.info(s"$name started")
      response = CatalogResponse(input.state.merchant.catalogMerchants, input.state.merchant.catalogProducts)
      _ <- logger.info(s"$name finished, merchants=${response.merchants.size}, products=${response.products.size}")
    yield response

end CatalogApi
