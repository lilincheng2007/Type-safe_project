import type { CustomerAccountPublic } from './CustomerAccountPublic'

export interface CustomerMeResponse {
  username: string
  role: 'customer'
  customerAccount: CustomerAccountPublic
}
