package delivery.model

/** Circe 编解码；模型定义已拆至同目录下 `Voucher.scala`、`OrderModels.scala` 等文件。 */

import io.circe.{Codec, Decoder, Encoder, Json}
import io.circe.generic.semiauto.*
import io.circe.syntax.*

object JsonCodecs:

  given Codec[Voucher] = deriveCodec
  given Codec[OrderItem] = deriveCodec

  private val orderDecoder0: Decoder[Order] = deriveDecoder
  private val orderEncoder0: Encoder[Order] = Encoder.instance { o =>
    val fields = List.newBuilder[(String, Json)]
    fields += "id" -> o.id.asJson
    fields += "customerId" -> o.customerId.asJson
    fields += "merchantId" -> o.merchantId.asJson
    o.riderId.foreach(r => fields += "riderId" -> r.asJson)
    fields += "items" -> o.items.asJson
    fields += "totalAmount" -> o.totalAmount.asJson
    fields += "deliveryAddress" -> o.deliveryAddress.asJson
    fields += "status" -> o.status.asJson
    fields += "placedAt" -> o.placedAt.asJson
    Json.obj(fields.result()*)
  }

  given Decoder[Order] = orderDecoder0
  given Encoder[Order] = orderEncoder0
  given Codec[Order] = Codec.from(orderDecoder0, orderEncoder0)

  given Codec[Customer] = deriveCodec
  given Codec[Product] = deriveCodec
  given Codec[Merchant] = deriveCodec
  given Codec[Rider] = deriveCodec
  given Codec[CustomerServiceAgent] = deriveCodec
  given Codec[OperationsManager] = deriveCodec
  given Codec[MerchantApplication] = deriveCodec
  given Codec[ComplaintTicket] = deriveCodec
  given Codec[PromotionCampaign] = deriveCodec

  given Codec[CustomerProfile] = deriveCodec
  given Codec[MerchantStoreProfile] = deriveCodec
  given Codec[MerchantProfile] = deriveCodec
  given Codec[RiderProfile] = deriveCodec

  given Codec[CustomerAccount] = deriveCodec
  given Codec[MerchantAccount] = deriveCodec
  given Codec[RiderAccount] = deriveCodec
  given Codec[AdminAccount] = deriveCodec
  given Codec[AccountStore] = deriveCodec
  given Codec[AppState] = deriveCodec
  given Codec[LoginRequest] = deriveCodec
  given Codec[RegisterRequest] = deriveCodec
  given Codec[LoginResponse] = deriveCodec
  given Codec[OkResponse] = deriveCodec
  given Codec[CheckoutLine] = deriveCodec
  given Codec[CheckoutRequest] = deriveCodec
  given Codec[CheckoutResponse] = deriveCodec
  given Codec[CustomerProfilePatch] = deriveCodec
  given Codec[MerchantProfileBody] = deriveCodec
  given Codec[CreateStoreRequest] = deriveCodec
  given Codec[CreateStoreResponse] = deriveCodec

  given Codec[CustomerAccountPublic] = deriveCodec
  given Codec[MerchantAccountPublic] = deriveCodec
  given Codec[RiderAccountPublic] = deriveCodec
  given Codec[AdminAccountPublic] = deriveCodec

  given Codec[CatalogResponse] = deriveCodec
  given Codec[OverviewResponse] = deriveCodec
  given Codec[OrdersPanelResponse] = deriveCodec
  given Codec[PlatformMetaResponse] = deriveCodec
  given Codec[ErrorBody] = deriveCodec

  /** 健康检查 */
  final case class HealthOk(ok: Boolean)
  given Codec[HealthOk] = deriveCodec

  given Codec[AuthCredential] = deriveCodec
  given Codec[UserServiceState] = deriveCodec
  given Codec[MerchantServiceState] = deriveCodec
  given Codec[RiderServiceState] = deriveCodec
  given Codec[AdminServiceState] = deriveCodec
  given Codec[OrderServiceState] = deriveCodec
  given Codec[CheckoutCompleteRequest] = deriveCodec
  given Codec[AttachOrdersRequest] = deriveCodec
  given Codec[BootstrapUserRequest] = deriveCodec
  given Codec[OrderBatch] = deriveCodec
  given Codec[RiderAdminExport] = deriveCodec

end JsonCodecs
