package delivery.admin.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.admin.service.AdminService
import delivery.admin.objects.PlatformMetaResponse
import delivery.shared.objects.DeliveryState

object PlatformMetaApi extends ApiPlan[PlatformMetaApi.PlatformMetaQuery, PlatformMetaResponse]:

  final case class PlatformMetaQuery(ref: Ref[IO, DeliveryState])

  override val name: String = "PlatformMetaApi"

  override def plan(input: PlatformMetaApi.PlatformMetaQuery): IO[PlatformMetaResponse] =
    AdminService.fetchPlatformMeta(input.ref)

end PlatformMetaApi
