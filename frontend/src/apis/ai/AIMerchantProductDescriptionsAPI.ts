import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { AIMerchantProductDescriptionsRequest } from '@/objects/ai/apiTypes/AIMerchantProductDescriptionsRequest'
import type { AIMerchantProductDescriptionsResponse } from '@/objects/ai/apiTypes/AIMerchantProductDescriptionsResponse'
import type { MerchantId } from '@/objects/shared/ids'

class AIMerchantProductDescriptionsAPI extends APIMessage<AIMerchantProductDescriptionsResponse> {
  readonly apiName = 'aimerchantproductdescriptionsapi'
  readonly merchantId: MerchantId
  readonly keywords: string

  constructor(request: AIMerchantProductDescriptionsRequest) {
    super()
    this.merchantId = request.merchantId
    this.keywords = request.keywords
  }
}

export function aiMerchantProductDescriptionsIO(
  request: AIMerchantProductDescriptionsRequest,
): TaskIO<AIMerchantProductDescriptionsResponse> {
  return sendAPI(new AIMerchantProductDescriptionsAPI(request))
}
