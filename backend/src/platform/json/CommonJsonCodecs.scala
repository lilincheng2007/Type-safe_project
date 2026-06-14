package delivery.platform.json

import delivery.domain.*
import delivery.domain.apiTypes.*
import delivery.platform.http.objects.*
import io.circe.Codec
import io.circe.Decoder
import io.circe.Encoder
import io.circe.generic.semiauto.*

object CommonJsonCodecs:

  def enumCodec[A](typeName: String, values: Array[A]): Codec[A] =
    Codec.from(
      Decoder.decodeString.emap { raw =>
        values.find(_.toString == raw).toRight(s"$typeName 不合法：$raw")
      },
      Encoder.encodeString.contramap[A](_.toString)
    )

  given Codec[UserRole] = enumCodec("用户角色", UserRole.values)
  given Codec[MerchantCategory] = enumCodec("商户分类", MerchantCategory.values)
  given Codec[RiderStatus] = enumCodec("骑手状态", RiderStatus.values)
  given Codec[ServiceChannel] = enumCodec("服务渠道", ServiceChannel.values)
  given Codec[OrderStatus] = Codec.from(
    Decoder.decodeString.emap(raw => OrderStatus.fromString(raw).toRight(s"订单状态 不合法：$raw")),
    Encoder.encodeString.contramap[OrderStatus](_.toString)
  )
  given Codec[RefundStatus] = enumCodec("退款状态", RefundStatus.values)
  given Codec[ListingStatus] = enumCodec("上下架状态", ListingStatus.values)
  given Codec[InventoryStatus] = enumCodec("库存状态", InventoryStatus.values)

  given Codec[HealthOk] = deriveCodec
  given Codec[OkResponse] = deriveCodec
  given Codec[ErrorBody] = deriveCodec

end CommonJsonCodecs
