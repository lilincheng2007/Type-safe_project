package delivery.admin.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.admin.objects.OrdersPanelResponse
import delivery.http.support.AuthHttp
import delivery.shared.json.ApiJsonCodecs.given
import delivery.shared.objects.DeliveryState
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.given
import org.http4s.dsl.io.*

object OrdersPanelApi:

  def routes(ref: Ref[IO, DeliveryState]): HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ GET -> Root / "api" / "delivery" / "orders-panel" =>
      AuthHttp.requireRole(req, "admin") { _ =>
        ref.get.flatMap { state =>
          Ok(OrdersPanelResponse(orders = state.order.orders, riders = state.rider.riders))
        }
      }
  }

end OrdersPanelApi
