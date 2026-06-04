import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { MerchantReviewsResponse } from '@/objects/review/apiTypes/MerchantReviewsResponse'
import type { MerchantId } from '@/objects/shared/ids'

class MerchantReviewsAPI extends APIMessage<MerchantReviewsResponse> {
  readonly apiName = 'merchantreviewsapi'
  readonly merchantId: MerchantId

  constructor(merchantId: MerchantId) {
    super()
    this.merchantId = merchantId
  }
}

export function fetchMerchantReviewsIO(merchantId: MerchantId): TaskIO<MerchantReviewsResponse> {
  return sendAPI(new MerchantReviewsAPI(merchantId))
}
