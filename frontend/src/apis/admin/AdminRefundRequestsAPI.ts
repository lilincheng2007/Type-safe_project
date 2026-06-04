import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { AdminRefundRequestsResponse } from '@/objects/admin/apiTypes/AdminRefundRequestsResponse'

class AdminRefundRequestsAPI extends APIMessage<AdminRefundRequestsResponse> {
  readonly apiName = 'adminrefundrequestsapi'
}

export function fetchAdminRefundRequestsIO(): TaskIO<AdminRefundRequestsResponse> {
  return sendAPI(new AdminRefundRequestsAPI())
}
