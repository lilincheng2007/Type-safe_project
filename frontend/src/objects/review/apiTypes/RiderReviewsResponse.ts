import type { ReviewSummary } from '../ReviewSummary'
import type { RiderReview } from '../RiderReview'

export interface RiderReviewsResponse {
  summary: ReviewSummary
  reviews: RiderReview[]
}
