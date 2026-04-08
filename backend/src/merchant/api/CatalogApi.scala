package delivery.merchant.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.merchant.objects.CatalogResponse
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.DeliveryState
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object CatalogApi:

  def routes(ref: Ref[IO, DeliveryState]): HttpRoutes[IO] = HttpRoutes.of[IO] {
    case GET -> Root / "api" / "delivery" / "catalog" =>
      ref.get.flatMap { state =>
        Ok(CatalogResponse(state.merchant.catalogMerchants, state.merchant.catalogProducts))
      }
  }

end CatalogApi
