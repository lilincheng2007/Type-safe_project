package delivery.admin.api

import cats.effect.IO
import delivery.shared.api.ApiPlan
import delivery.shared.objects.HealthOk

object HealthApi extends ApiPlan[HealthApi.HealthQuery.type, HealthOk]:

  case object HealthQuery

  override val name: String = "HealthApi"

  override def plan(input: HealthApi.HealthQuery.type): IO[HealthOk] =
    IO.pure(HealthOk(ok = true))

end HealthApi
