package delivery.rider.routes

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.objects.DeliveryState
import org.http4s.HttpRoutes

object RiderRoutes:

  def routes(ref: Ref[IO, DeliveryState]): HttpRoutes[IO] = HttpRoutes.empty

end RiderRoutes
