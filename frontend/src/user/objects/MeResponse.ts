import type { AdminMeResponse } from '@/admin/objects/AdminMeResponse'
import type { MerchantMeResponse } from '@/merchant/objects/MerchantMeResponse'
import type { RiderMeResponse } from '@/rider/objects/RiderMeResponse'
import type { CustomerMeResponse } from './CustomerMeResponse'

export type MeResponse = CustomerMeResponse | MerchantMeResponse | RiderMeResponse | AdminMeResponse
