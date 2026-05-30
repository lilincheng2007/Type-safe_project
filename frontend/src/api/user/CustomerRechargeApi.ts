import { APIMessage } from '@/api/shared/APIMessage'
import type { TaskIO } from '@/api/shared/TaskIO'
import { sendAPI } from '@/api/shared/sendAPI'
import type { CustomerWalletTopUp } from '@/objects/user/CustomerWalletTopUp'
import type { CustomerWalletTopUpResponse } from '@/objects/user/CustomerWalletTopUpResponse'

class CustomerRechargeAPI extends APIMessage<CustomerWalletTopUpResponse> {
  readonly apiName = 'customerrechargeapi'
  readonly amount: number

  constructor(amount: number) {
    super()
    this.amount = amount
  }
}

export function rechargeCustomerWalletIO(input: CustomerWalletTopUp): TaskIO<CustomerWalletTopUpResponse> {
  return sendAPI(new CustomerRechargeAPI(input.amount))
}
