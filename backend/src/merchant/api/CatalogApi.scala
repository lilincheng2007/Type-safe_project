package delivery.merchant.api

import cats.effect.IO
import delivery.shared.api.ApiPlan
import delivery.merchant.objects.CatalogResponse
import delivery.shared.objects.DeliveryState
import org.typelevel.log4cats.slf4j.Slf4jLogger

object CatalogApi extends ApiPlan[CatalogApi.CatalogQuery, CatalogResponse]:

  private def isVisibleProduct(product: delivery.merchant.objects.Product): Boolean =
    product.listingStatus == "上架"

  final case class CatalogQuery(state: DeliveryState)

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "CatalogApi"

  override def plan(input: CatalogApi.CatalogQuery): IO[CatalogResponse] =
    for
      _ <- logger.info(s"$name started")
      visibleProducts = input.state.merchant.catalogProducts.filter(isVisibleProduct)
      visibleProductIds = visibleProducts.map(_.id).toSet
      visibleMerchants = input.state.merchant.catalogMerchants.map { merchant =>
        merchant.copy(featuredProductIds = merchant.featuredProductIds.filter(visibleProductIds.contains))
      }
      response = CatalogResponse(visibleMerchants, visibleProducts)
      _ <- logger.info(s"$name finished, merchants=${response.merchants.size}, products=${response.products.size}")
    yield response

end CatalogApi
