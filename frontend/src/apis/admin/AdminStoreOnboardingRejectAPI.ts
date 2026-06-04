import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OkResponse } from '@/objects/shared/apiTypes/OkResponse'

class AdminStoreOnboardingRejectAPI extends APIMessage<OkResponse> {
  readonly apiName = 'adminstoreonboardingrejectapi'
  readonly requestId: string
  readonly rejectionReason: string

  constructor(requestId: string, rejectionReason: string) {
    super()
    this.requestId = requestId
    this.rejectionReason = rejectionReason
  }
}

export function rejectStoreOnboardingRequestIO(requestId: string, rejectionReason: string): TaskIO<OkResponse> {
  return sendAPI(new AdminStoreOnboardingRejectAPI(requestId, rejectionReason))
}
