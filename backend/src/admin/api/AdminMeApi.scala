package delivery.admin.api

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.shared.api.ApiPlan
import delivery.admin.service.AdminService
import delivery.admin.objects.AdminMeResponse
import delivery.shared.objects.DeliveryState

object AdminMeApi extends ApiPlan[AdminMeApi.AdminMeQuery, Option[AdminMeResponse]]:

  final case class AdminMeQuery(ref: Ref[IO, DeliveryState], username: String)

  override val name: String = "AdminMeApi"

  override def plan(input: AdminMeApi.AdminMeQuery): IO[Option[AdminMeResponse]] =
    AdminService.fetchAdminMe(input.ref, input.username)

end AdminMeApi
