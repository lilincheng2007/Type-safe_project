import type { MerchantAccountPublic } from './MerchantAccountPublic'

export interface MerchantMeResponse {
  username: string
  role: 'merchant'
  merchantAccount: MerchantAccountPublic
}
