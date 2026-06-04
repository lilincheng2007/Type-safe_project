package delivery.review.objects.apiTypes

import delivery.review.objects.{ReviewSummary, RiderReview}

final case class RiderReviewsResponse(summary: ReviewSummary, reviews: List[RiderReview])
