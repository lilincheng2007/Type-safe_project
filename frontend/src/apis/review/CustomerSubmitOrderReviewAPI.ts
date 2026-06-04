import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OkResponse } from '@/objects/shared/apiTypes/OkResponse'
import type { OrderId } from '@/objects/shared/ids'

class CustomerSubmitOrderReviewAPI extends APIMessage<OkResponse> {
  readonly apiName = 'customersubmitorderreviewapi'
  readonly orderId: OrderId
  readonly merchantRating: number
  readonly merchantDescription: string
  readonly merchantImageUrl: string | null
  readonly riderRating: number | null

  constructor(orderId: OrderId, merchantRating: number, merchantDescription: string, merchantImageUrl: string | null, riderRating: number | null) {
    super()
    this.orderId = orderId
    this.merchantRating = merchantRating
    this.merchantDescription = merchantDescription
    this.merchantImageUrl = merchantImageUrl
    this.riderRating = riderRating
  }
}

export function submitOrderReviewIO(input: {
  orderId: OrderId
  merchantRating: number
  merchantDescription: string
  merchantImageUrl: string | null
  riderRating: number | null
}): TaskIO<OkResponse> {
  return sendAPI(new CustomerSubmitOrderReviewAPI(input.orderId, input.merchantRating, input.merchantDescription, input.merchantImageUrl, input.riderRating))
}
