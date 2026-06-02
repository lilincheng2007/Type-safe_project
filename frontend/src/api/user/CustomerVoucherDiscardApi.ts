import { APIMessage } from '@/api/shared/APIMessage'
import type { TaskIO } from '@/api/shared/TaskIO'
import { sendAPI } from '@/api/shared/sendAPI'
import type { OkResponse } from '@/objects/shared/OkResponse'
import type { VoucherId } from '@/objects/shared/ids'

class CustomerVoucherDiscardAPI extends APIMessage<OkResponse> {
  readonly apiName = 'customervoucherdiscardapi'
  readonly voucherId: VoucherId

  constructor(voucherId: VoucherId) {
    super()
    this.voucherId = voucherId
  }
}

export function discardCustomerVoucherIO(voucherId: VoucherId): TaskIO<OkResponse> {
  return sendAPI(new CustomerVoucherDiscardAPI(voucherId))
}
