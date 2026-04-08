import type { CheckoutLine } from './CheckoutLine'

export interface CheckoutRequest {
  lines: CheckoutLine[]
}
