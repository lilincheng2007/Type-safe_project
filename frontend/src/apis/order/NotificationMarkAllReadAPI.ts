import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OkResponse } from '@/objects/shared/apiTypes/OkResponse'

class NotificationMarkAllReadAPI extends APIMessage<OkResponse> {
  readonly apiName = 'notificationmarkallreadapi'
  readonly notificationIds: string[]

  constructor(notificationIds: string[]) {
    super()
    this.notificationIds = notificationIds
  }
}

export function markAllNotificationsReadIO(notificationIds: string[]): TaskIO<OkResponse> {
  return sendAPI(new NotificationMarkAllReadAPI(notificationIds))
}
