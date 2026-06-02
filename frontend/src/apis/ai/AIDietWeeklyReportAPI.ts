import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { AIDietWeeklyReportRequest } from '@/objects/ai/apiTypes/AIDietWeeklyReportRequest'
import type { AIDietWeeklyReportResponse } from '@/objects/ai/apiTypes/AIDietWeeklyReportResponse'

class AIDietWeeklyReportAPI extends APIMessage<AIDietWeeklyReportResponse> {
  readonly apiName = 'aidietweeklyreportapi'

  constructor(_request: AIDietWeeklyReportRequest) {
    super()
  }
}

export function aiDietWeeklyReportIO(request: AIDietWeeklyReportRequest): TaskIO<AIDietWeeklyReportResponse> {
  return sendAPI(new AIDietWeeklyReportAPI(request))
}
