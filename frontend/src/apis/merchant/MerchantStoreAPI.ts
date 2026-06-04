import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { CreateStoreRequest } from '@/objects/merchant/apiTypes/CreateStoreRequest'

class MerchantStoreAPI extends APIMessage<string> {
  readonly apiName = 'merchantstoreapi'
  readonly storeName: string
  readonly address: string
  readonly description: string

  constructor(storeName: string, address: string, description: string) {
    super()
    this.storeName = storeName
    this.address = address
    this.description = description
  }
}

export function createMerchantStoreIO(input: CreateStoreRequest): TaskIO<string> {
  return sendAPI(new MerchantStoreAPI(input.storeName, input.address, input.description))
}
