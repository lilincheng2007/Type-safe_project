package delivery.merchant.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.merchant.objects.MerchantProfileBody
import delivery.merchant.service.MerchantService
import delivery.shared.objects.{DeliveryState, OkResponse}
import org.typelevel.log4cats.slf4j.Slf4jLogger

object MerchantProfileApi extends ApiPlan[MerchantProfileApi.MerchantProfileCommand, Either[String, OkResponse]]:

  final case class MerchantProfileCommand(
      ref: Ref[IO, DeliveryState],
      persist: DeliveryState => IO[Unit],
      username: String,
      body: MerchantProfileBody
  )

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "MerchantProfileApi"

  override def plan(input: MerchantProfileApi.MerchantProfileCommand): IO[Either[String, OkResponse]] =
    for
      _ <- logger.info(s"$name started, username=${input.username}")
      response <- MerchantService.replaceProfile(input.ref, input.persist, input.username, input.body)
      _ <- logger.info(s"$name finished, success=${response.isRight}")
    yield response

end MerchantProfileApi
