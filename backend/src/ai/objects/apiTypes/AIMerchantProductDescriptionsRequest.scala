package delivery.ai.objects.apiTypes

import delivery.shared.objects.MerchantId

final case class AIMerchantProductDescriptionsRequest(merchantId: MerchantId, keywords: String)
