package delivery.shared.json

import delivery.admin.objects.*
import delivery.merchant.objects.*
import delivery.order.objects.*
import delivery.rider.objects.*
import delivery.shared.objects.*
import delivery.user.objects.*
import io.circe.Codec
import io.circe.generic.semiauto.*

object ApiJsonCodecs:

  import delivery.model.JsonCodecs.given

  given Codec[DeliveryState] = deriveCodec
  given Codec[HealthOk] = deriveCodec
  given Codec[OkResponse] = deriveCodec
  given Codec[ErrorBody] = deriveCodec

  given Codec[LoginRequest] = deriveCodec
  given Codec[RegisterRequest] = deriveCodec
  given Codec[LoginResponse] = deriveCodec
  given Codec[CustomerProfilePatch] = deriveCodec
  given Codec[CustomerAccountPublic] = deriveCodec
  given Codec[CustomerMeResponse] = deriveCodec

  given Codec[CheckoutLine] = deriveCodec
  given Codec[CheckoutRequest] = deriveCodec
  given Codec[CheckoutResponse] = deriveCodec

  given Codec[MerchantProfileBody] = deriveCodec
  given Codec[CreateStoreRequest] = deriveCodec
  given Codec[CreateStoreResponse] = deriveCodec
  given Codec[CatalogResponse] = deriveCodec
  given Codec[MerchantAccountPublic] = deriveCodec
  given Codec[MerchantMeResponse] = deriveCodec

  given Codec[RiderAccountPublic] = deriveCodec
  given Codec[RiderMeResponse] = deriveCodec

  given Codec[AdminAccountPublic] = deriveCodec
  given Codec[AdminMeResponse] = deriveCodec
  given Codec[OverviewResponse] = deriveCodec
  given Codec[OrdersPanelResponse] = deriveCodec
  given Codec[PlatformMetaResponse] = deriveCodec

end ApiJsonCodecs
