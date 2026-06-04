import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OkResponse } from '@/objects/shared/apiTypes/OkResponse'

class CustomerReviewVoteAPI extends APIMessage<OkResponse> {
  readonly apiName = 'customerreviewvoteapi'
  readonly reviewId: string
  readonly vote: 'up' | 'down' | 'none'

  constructor(reviewId: string, vote: 'up' | 'down' | 'none') {
    super()
    this.reviewId = reviewId
    this.vote = vote
  }
}

export function voteMerchantReviewIO(reviewId: string, vote: 'up' | 'down' | 'none'): TaskIO<OkResponse> {
  return sendAPI(new CustomerReviewVoteAPI(reviewId, vote))
}
