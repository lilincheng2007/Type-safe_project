/** 与后端 `CustomerModel.scala` 对齐 */

import type { OrderId, UserId } from './ids'
import type { Voucher } from './voucher'

export interface Customer {
  id: UserId
  name: string
  phone: string
  defaultAddress: string
  walletBalance: number
  orderHistoryIds: OrderId[]
  vouchers: Voucher[]
}
