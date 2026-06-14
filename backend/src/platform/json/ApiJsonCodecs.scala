package delivery.platform.json

object ApiJsonCodecs:
  export delivery.platform.json.CommonJsonCodecs.given
  export delivery.promotion.json.PromotionJsonCodecs.given
  export delivery.order.json.OrderJsonCodecs.given
  export delivery.merchant.json.MerchantJsonCodecs.given
  export delivery.user.json.UserJsonCodecs.given
  export delivery.admin.json.AdminJsonCodecs.given
  export delivery.review.json.ReviewJsonCodecs.given
  export delivery.rider.json.RiderJsonCodecs.given
  export delivery.ai.json.AIJsonCodecs.given

end ApiJsonCodecs
