package delivery.ai.json

import delivery.ai.objects.*
import delivery.ai.objects.apiTypes.*
import delivery.merchant.json.MerchantJsonCodecs.given
import delivery.review.json.ReviewJsonCodecs.given
import io.circe.Codec
import io.circe.generic.semiauto.*

object AIJsonCodecs:

  given Codec[AIRecommendedProduct] = deriveCodec
  given Codec[AIRecommendedMerchant] = deriveCodec
  given Codec[AISearchResponse] = deriveCodec
  given Codec[AISearchRequest] = deriveCodec
  given Codec[AIMerchantStoreDescriptionRequest] = deriveCodec
  given Codec[AIMerchantStoreDescriptionResponse] = deriveCodec
  given Codec[AIMerchantBusinessSuggestionsResponse] = deriveCodec
  given Codec[AIMerchantProductDescriptionsRequest] = deriveCodec
  given Codec[AIGeneratedProductDescription] = deriveCodec
  given Codec[AIMerchantProductDescriptionsResponse] = deriveCodec
  given Codec[AIReviewSummaryResponse] = deriveCodec

end AIJsonCodecs
