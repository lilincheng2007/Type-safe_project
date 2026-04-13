package delivery.merchant.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.merchant.objects.{CreateStoreRequest, CreateStoreResponse}
import delivery.merchant.service.MerchantService
import delivery.shared.objects.DeliveryState
import org.typelevel.log4cats.slf4j.Slf4jLogger

object MerchantStoreApi extends ApiPlan[MerchantStoreApi.MerchantStoreCommand, Either[String, CreateStoreResponse]]:

  final case class MerchantStoreCommand(
      ref: Ref[IO, DeliveryState],
      persist: DeliveryState => IO[Unit],
      username: String,
      body: CreateStoreRequest
  )

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "MerchantStoreApi"

  override def plan(input: MerchantStoreApi.MerchantStoreCommand): IO[Either[String, CreateStoreResponse]] =
    for
      _ <- logger.info(s"$name started, username=${input.username}")
      response <- MerchantService.createStore(input.ref, input.persist, input.username, input.body)
      _ <- logger.info(s"$name finished, success=${response.isRight}")
    yield response

end MerchantStoreApi
