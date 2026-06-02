package delivery.user.objects.apiTypes

type MeResponse =
  CustomerMeResponse | delivery.merchant.objects.apiTypes.MerchantMeResponse | delivery.rider.objects.apiTypes.RiderMeResponse
