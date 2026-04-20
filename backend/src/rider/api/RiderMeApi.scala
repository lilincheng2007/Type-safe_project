package delivery.rider.api

import cats.effect.IO
import delivery.shared.api.ApiPlan
import delivery.rider.objects.RiderMeResponse
import delivery.rider.utils.RiderApiSupport
import delivery.shared.objects.DeliveryState
import org.typelevel.log4cats.slf4j.Slf4jLogger

object RiderMeApi extends ApiPlan[RiderMeApi.RiderMeQuery, Option[RiderMeResponse]]:

  final case class RiderMeQuery(state: DeliveryState, username: String)

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "RiderMeApi"

  override def plan(input: RiderMeApi.RiderMeQuery): IO[Option[RiderMeResponse]] =
    for
      _ <- logger.info(s"$name started, username=${input.username}")
      availableOrders = input.state.order.orders.filter(order => order.status == "待接单" && order.riderId.isEmpty)
      response = input.state.rider.riderAccounts.find(_.username == input.username).map(account =>
        RiderApiSupport.riderMeResponse(input.username, account, availableOrders)
      )
      _ <- logger.info(s"$name finished, found=${response.isDefined}")
    yield response

end RiderMeApi
