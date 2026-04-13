package delivery.user.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.shared.objects.DeliveryState
import delivery.user.objects.CustomerMeResponse
import delivery.user.service.UserService
import org.typelevel.log4cats.slf4j.Slf4jLogger

object CustomerMeApi extends ApiPlan[CustomerMeApi.CustomerMeQuery, Option[CustomerMeResponse]]:

  final case class CustomerMeQuery(ref: Ref[IO, DeliveryState], username: String)

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "CustomerMeApi"

  override def plan(input: CustomerMeApi.CustomerMeQuery): IO[Option[CustomerMeResponse]] =
    for
      _ <- logger.info(s"$name started, username=${input.username}")
      response <- UserService.fetchCustomerMe(input.ref, input.username)
      _ <- logger.info(s"$name finished, found=${response.isDefined}")
    yield response

end CustomerMeApi
