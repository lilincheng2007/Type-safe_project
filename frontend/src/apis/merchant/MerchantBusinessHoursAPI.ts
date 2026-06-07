import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { MerchantBusinessStatus, MerchantHolidayBusinessHour, MerchantWeeklyBusinessHour } from '@/objects/merchant/MerchantBusinessHours'
import type { OkResponse } from '@/objects/shared/apiTypes/OkResponse'
import type { MerchantId } from '@/objects/shared/ids'

class MerchantBusinessHoursAPI extends APIMessage<OkResponse> {
  readonly apiName = 'merchantbusinesshoursapi'
  readonly merchantId: MerchantId
  readonly businessStatus: MerchantBusinessStatus
  readonly weeklyBusinessHours: MerchantWeeklyBusinessHour[]
  readonly holidayBusinessHours: MerchantHolidayBusinessHour[]

  constructor(
    merchantId: MerchantId,
    businessStatus: MerchantBusinessStatus,
    weeklyBusinessHours: MerchantWeeklyBusinessHour[],
    holidayBusinessHours: MerchantHolidayBusinessHour[],
  ) {
    super()
    this.merchantId = merchantId
    this.businessStatus = businessStatus
    this.weeklyBusinessHours = weeklyBusinessHours
    this.holidayBusinessHours = holidayBusinessHours
  }
}

export function updateMerchantBusinessHoursIO(input: {
  merchantId: MerchantId
  businessStatus: MerchantBusinessStatus
  weeklyBusinessHours: MerchantWeeklyBusinessHour[]
  holidayBusinessHours: MerchantHolidayBusinessHour[]
}): TaskIO<OkResponse> {
  return sendAPI(new MerchantBusinessHoursAPI(input.merchantId, input.businessStatus, input.weeklyBusinessHours, input.holidayBusinessHours))
}
