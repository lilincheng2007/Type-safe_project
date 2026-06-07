import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { AdminOrderMonitorResponse } from '@/objects/admin/apiTypes/AdminOrderMonitorResponse'

class AdminOrderMonitorAPI extends APIMessage<AdminOrderMonitorResponse> {
  readonly apiName = 'adminordermonitorapi'
}

export function fetchAdminOrderMonitorIO(): TaskIO<AdminOrderMonitorResponse> {
  return sendAPI(new AdminOrderMonitorAPI())
}
