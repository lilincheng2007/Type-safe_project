import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { NotificationReadStatesResponse } from '@/objects/order/apiTypes/NotificationReadStatesResponse'

class NotificationReadStatesAPI extends APIMessage<NotificationReadStatesResponse> {
  readonly apiName = 'notificationreadstatesapi'
}

export function fetchNotificationReadStatesIO(): TaskIO<NotificationReadStatesResponse> {
  return sendAPI(new NotificationReadStatesAPI())
}
