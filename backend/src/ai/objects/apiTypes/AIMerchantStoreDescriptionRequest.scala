package delivery.ai.objects.apiTypes

import delivery.shared.objects.MerchantId

final case class AIMerchantStoreDescriptionRequest(merchantId: MerchantId, keywords: String)
