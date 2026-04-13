package delivery.admin.api

import cats.effect.IO
import delivery.shared.api.ApiPlan
import delivery.shared.objects.HealthOk
import org.typelevel.log4cats.slf4j.Slf4jLogger

object HealthApi extends ApiPlan[HealthApi.HealthQuery.type, HealthOk]:

  case object HealthQuery

  private val logger = Slf4jLogger.getLogger[IO]

  override val name: String = "HealthApi"

  override def plan(input: HealthApi.HealthQuery.type): IO[HealthOk] =
    for
      _ <- logger.info(s"$name started")
      response <- IO.pure(HealthOk(ok = true))
      _ <- logger.info(s"$name finished, ok=${response.ok}")
    yield response

end HealthApi
