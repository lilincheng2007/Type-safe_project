package delivery

import cats.effect.IO
import delivery.admin.routes.AdminRoutes
import delivery.ai.routes.AIRoutes
import delivery.merchant.routes.MerchantRoutes
import delivery.order.routes.OrderRoutes
import delivery.review.routes.ReviewRoutes
import delivery.rider.routes.RiderRoutes
import delivery.shared.api.APIMessageRouter
import delivery.user.routes.UserRoutes
import org.http4s.HttpRoutes
import org.http4s.server.Router

import javax.sql.DataSource

object DeliveryRoutes:

  def apply(ds: DataSource): HttpRoutes[IO] =
    Router(
      "/api" -> APIMessageRouter.routes(
        UserRoutes.apiMessages ++ MerchantRoutes.apiMessages ++ OrderRoutes.apiMessages ++ RiderRoutes.apiMessages ++ AIRoutes.apiMessages ++ AdminRoutes.apiMessages ++ ReviewRoutes.apiMessages,
        ds
      ),
      "/api/merchant/store-images" -> MerchantRoutes.storeImagePublicRoutes,
      "/api/orders/refund-images" -> OrderRoutes.refundImagePublicRoutes,
      "/api/reviews/images" -> ReviewRoutes.imagePublicRoutes
    )

end DeliveryRoutes
