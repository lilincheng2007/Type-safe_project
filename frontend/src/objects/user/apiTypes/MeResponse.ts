import type { MerchantMeResponse } from '@/objects/merchant/apiTypes/MerchantMeResponse'
import type { RiderMeResponse } from '@/objects/rider/apiTypes/RiderMeResponse'
import type { CustomerMeResponse } from './CustomerMeResponse'

export type MeResponse = CustomerMeResponse | MerchantMeResponse | RiderMeResponse
