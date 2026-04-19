package delivery.merchant.api

import cats.effect.IO
import delivery.shared.api.ApiPlan
import delivery.merchant.objects.MerchantMeResponse
import delivery.merchant.utils.MerchantApiSupport
import delivery.shared.objects.DeliveryState
import org.typelevel.log4cats.slf4j.Slf4jLogger

object MerchantMeApi extends ApiPlan[MerchantMeApi.MerchantMeQuery, Option[MerchantMeResponse]]:

  final case class MerchantMeQuery(state: DeliveryState, username: String)

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "MerchantMeApi"

  override def plan(input: MerchantMeApi.MerchantMeQuery): IO[Option[MerchantMeResponse]] =
    for
      _ <- logger.info(s"$name started, username=${input.username}")
      response = input.state.merchant.merchantAccounts.find(_.username == input.username).map(account => MerchantApiSupport.merchantMeResponse(input.username, account))
      _ <- logger.info(s"$name finished, found=${response.isDefined}")
    yield response

end MerchantMeApi
