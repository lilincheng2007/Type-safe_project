import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { StoreOnboardingRequestsResponse } from '@/objects/admin/apiTypes/StoreOnboardingRequestsResponse'

class MerchantStoreOnboardingRequestsAPI extends APIMessage<StoreOnboardingRequestsResponse> {
  readonly apiName = 'merchantstoreonboardingrequestsapi'
}

export function fetchMerchantStoreOnboardingRequestsIO(): TaskIO<StoreOnboardingRequestsResponse> {
  return sendAPI(new MerchantStoreOnboardingRequestsAPI())
}
