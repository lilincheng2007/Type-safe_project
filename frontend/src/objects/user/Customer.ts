import type { Voucher } from '../shared/Voucher'

export interface Customer {
  id: string
  name: string
  phone: string
  defaultAddress: string
  walletBalance: number
  orderHistoryIds: string[]
  vouchers: Voucher[]
}
