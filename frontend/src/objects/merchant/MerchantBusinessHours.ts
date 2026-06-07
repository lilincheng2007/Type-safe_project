export type MerchantBusinessStatus = 'open' | 'resting' | 'closedToday' | 'paused'

export interface MerchantWeeklyBusinessHour {
  dayOfWeek: number
  startTime: string
  endTime: string
  enabled: boolean
}

export interface MerchantHolidayBusinessHour {
  date: string
  businessStatus: MerchantBusinessStatus
  startTime?: string | null
  endTime?: string | null
}
