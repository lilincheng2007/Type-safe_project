import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { CustomerWalletTopUp } from '@/objects/user/CustomerWalletTopUp'
import type { CustomerWalletTopUpResponse } from '@/objects/user/apiTypes/CustomerWalletTopUpResponse'

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
