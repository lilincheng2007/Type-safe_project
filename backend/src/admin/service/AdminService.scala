package delivery.admin.service

import cats.effect.IO
import cats.effect.kernel.Ref
import delivery.admin.objects.{AdminMeResponse, OrdersPanelResponse, OverviewResponse, PlatformMetaResponse}
import delivery.admin.repository.AdminRepository
import delivery.admin.tables.AdminTables
import delivery.admin.utils.AdminApiSupport
import delivery.merchant.tables.MerchantTables
import delivery.order.tables.OrderTables
import delivery.rider.tables.RiderTables
import delivery.shared.objects.DeliveryState
import delivery.user.tables.UserTables
import io.circe.Json

object AdminService:

  def fetchAdminMe(ref: Ref[IO, DeliveryState], username: String): IO[Option[AdminMeResponse]] =
    ref.get.map { state =>
      AdminRepository.findAdminAccount(state, username).map(account => AdminApiSupport.adminMeResponse(username, account))
    }

  def fetchOverview(ref: Ref[IO, DeliveryState]): IO[OverviewResponse] =
    ref.get.map(AdminApiSupport.overview)

  def fetchOrdersPanel(ref: Ref[IO, DeliveryState]): IO[OrdersPanelResponse] =
    ref.get.map(AdminApiSupport.ordersPanel)

  def fetchPlatformMeta(ref: Ref[IO, DeliveryState]): IO[PlatformMetaResponse] =
    ref.get.map(AdminApiSupport.platformMeta)

  def moduleMetadataJson: Json =
    Json.obj(
      "user" -> moduleJson(UserTables.all),
      "order" -> moduleJson(OrderTables.all),
      "merchant" -> moduleJson(MerchantTables.all),
      "rider" -> moduleJson(RiderTables.all),
      "admin" -> moduleJson(AdminTables.all)
    )

  private def moduleJson(tableNames: List[String]): Json =
    Json.obj(
      "layers" -> Json.arr(
        Json.fromString("api"),
        Json.fromString("objects"),
        Json.fromString("tables"),
        Json.fromString("utils"),
        Json.fromString("service"),
        Json.fromString("repository")
      ),
      "tables" -> Json.arr(tableNames.map(Json.fromString)*)
    )

end AdminService
