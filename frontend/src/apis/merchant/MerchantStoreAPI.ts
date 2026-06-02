import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { CreateStoreRequest } from '@/objects/merchant/apiTypes/CreateStoreRequest'

class MerchantStoreAPI extends APIMessage<string> {
  readonly apiName = 'merchantstoreapi'
  readonly storeName: string
  readonly address: string

  constructor(storeName: string, address: string) {
    super()
    this.storeName = storeName
    this.address = address
  }
}

export function createMerchantStoreIO(input: CreateStoreRequest): TaskIO<string> {
  return sendAPI(new MerchantStoreAPI(input.storeName, input.address))
}
