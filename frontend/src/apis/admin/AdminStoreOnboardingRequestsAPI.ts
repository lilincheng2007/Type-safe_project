import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { StoreOnboardingRequestsResponse } from '@/objects/admin/apiTypes/StoreOnboardingRequestsResponse'

class AdminStoreOnboardingRequestsAPI extends APIMessage<StoreOnboardingRequestsResponse> {
  readonly apiName = 'adminstoreonboardingrequestsapi'
}

export function fetchAdminStoreOnboardingRequestsIO(): TaskIO<StoreOnboardingRequestsResponse> {
  return sendAPI(new AdminStoreOnboardingRequestsAPI())
}
