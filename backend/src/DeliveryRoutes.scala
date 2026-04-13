package delivery

import cats.effect.IO
import cats.effect.kernel.Ref
import cats.syntax.all.*
import delivery.admin.routes.AdminRoutes
import delivery.merchant.routes.MerchantRoutes
import delivery.order.routes.OrderRoutes
import delivery.rider.routes.RiderRoutes
import delivery.shared.objects.DeliveryState
import delivery.user.routes.UserRoutes
import org.http4s.HttpRoutes

object DeliveryRoutes:

  def apply(ref: Ref[IO, DeliveryState], persist: DeliveryState => IO[Unit]): HttpRoutes[IO] =
    AdminRoutes.routes(ref) <+>
      UserRoutes.routes(ref, persist) <+>
      MerchantRoutes.routes(ref, persist) <+>
      RiderRoutes.routes(ref) <+>
      OrderRoutes.routes(ref, persist)

end DeliveryRoutes
