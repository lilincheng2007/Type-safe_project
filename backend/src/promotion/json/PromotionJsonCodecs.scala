package delivery.promotion.json

import delivery.platform.json.CommonJsonCodecs.enumCodec
import delivery.promotion.objects.*
import io.circe.Codec
import io.circe.generic.semiauto.*

object PromotionJsonCodecs:

  given Codec[PromotionDiscountType] = enumCodec("优惠类型", PromotionDiscountType.values)
  given Codec[PromotionTriggerType] = enumCodec("优惠触发类型", PromotionTriggerType.values)
  given Codec[Voucher] = deriveCodec
  given Codec[Promotion] = deriveCodec

end PromotionJsonCodecs
