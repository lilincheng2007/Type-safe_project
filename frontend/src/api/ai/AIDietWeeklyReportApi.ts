import { APIMessage } from '@/api/shared/APIMessage'
import type { TaskIO } from '@/api/shared/TaskIO'
import { sendAPI } from '@/api/shared/sendAPI'
import type { AIDietWeeklyReportRequest } from '@/objects/ai/AIDietWeeklyReportRequest'
import type { AIDietWeeklyReportResponse } from '@/objects/ai/AIDietWeeklyReportResponse'

class AIDietWeeklyReportAPI extends APIMessage<AIDietWeeklyReportResponse> {
  readonly apiName = 'aidietweeklyreportapi'

  constructor(_request: AIDietWeeklyReportRequest) {
    super()
  }
}

export function aiDietWeeklyReportIO(request: AIDietWeeklyReportRequest): TaskIO<AIDietWeeklyReportResponse> {
  return sendAPI(new AIDietWeeklyReportAPI(request))
}
