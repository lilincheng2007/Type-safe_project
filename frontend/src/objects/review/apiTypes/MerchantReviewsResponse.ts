import type { MerchantReview } from '../MerchantReview'
import type { ReviewSummary } from '../ReviewSummary'

export interface MerchantReviewsResponse {
  summary: ReviewSummary
  reviews: MerchantReview[]
}
