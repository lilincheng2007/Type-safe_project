import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { OkResponse } from '@/objects/shared/apiTypes/OkResponse'

class NotificationMarkReadAPI extends APIMessage<OkResponse> {
  readonly apiName = 'notificationmarkreadapi'
  readonly notificationId: string

  constructor(notificationId: string) {
    super()
    this.notificationId = notificationId
  }
}

export function markNotificationReadIO(notificationId: string): TaskIO<OkResponse> {
  return sendAPI(new NotificationMarkReadAPI(notificationId))
}
