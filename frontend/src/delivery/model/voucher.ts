/** 与后端 `Voucher.scala` 对齐 */

import type { VoucherId } from './ids'

export interface Voucher {
  id: VoucherId
  title: string
  discountAmount: number
  minSpend: number
  expiresAt: string
  remainingCount: number
}
