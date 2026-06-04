package delivery.review.objects.apiTypes

import delivery.review.objects.{MerchantReview, ReviewSummary}

final case class MerchantReviewsResponse(summary: ReviewSummary, reviews: List[MerchantReview])
