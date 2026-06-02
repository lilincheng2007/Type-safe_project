package delivery.ai.objects.apiTypes

import delivery.ai.objects.AIGeneratedProductDescription
import delivery.shared.objects.MerchantId

final case class AIMerchantProductDescriptionsResponse(
    merchantId: MerchantId,
    products: List[AIGeneratedProductDescription],
    generatedAt: String
)
