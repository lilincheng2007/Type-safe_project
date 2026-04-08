package delivery

import cats.effect.IO
import cats.effect.kernel.Ref
import cats.syntax.all.*
import delivery.admin.api.*
import delivery.merchant.api.*
import delivery.order.api.CheckoutApi
import delivery.rider.api.RiderMeApi
import delivery.shared.objects.DeliveryState
import delivery.user.api.*
import org.http4s.HttpRoutes

object DeliveryRoutes:

  def apply(ref: Ref[IO, DeliveryState], persist: DeliveryState => IO[Unit]): HttpRoutes[IO] =
    HealthApi.routes <+>
      LoginApi.routes(ref) <+>
      RegisterApi.routes(ref, persist) <+>
      CustomerMeApi.routes(ref) <+>
      MerchantMeApi.routes(ref) <+>
      RiderMeApi.routes(ref) <+>
      AdminMeApi.routes(ref) <+>
      CustomerProfilePatchApi.routes(ref, persist) <+>
      CatalogApi.routes(ref) <+>
      MerchantProfileApi.routes(ref, persist) <+>
      MerchantStoreApi.routes(ref, persist) <+>
      CheckoutApi.routes(ref, persist) <+>
      OverviewApi.routes(ref) <+>
      OrdersPanelApi.routes(ref) <+>
      PlatformMetaApi.routes(ref)

end DeliveryRoutes
