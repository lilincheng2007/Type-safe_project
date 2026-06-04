import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OkResponse } from '@/objects/shared/apiTypes/OkResponse'

class AdminStoreOnboardingAcceptAPI extends APIMessage<OkResponse> {
  readonly apiName = 'adminstoreonboardingacceptapi'
  readonly requestId: string

  constructor(requestId: string) {
    super()
    this.requestId = requestId
  }
}

export function acceptStoreOnboardingRequestIO(requestId: string): TaskIO<OkResponse> {
  return sendAPI(new AdminStoreOnboardingAcceptAPI(requestId))
}
