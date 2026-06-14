import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { CreateStoreRequest } from '@/objects/merchant/apiTypes/CreateStoreRequest'

class MerchantCreateStoreOnboardingRequestAPI extends APIMessage<string> {
  readonly apiName = 'merchantcreatestoreonboardingrequestapi'
  readonly storeName: string
  readonly address: string
  readonly description: string
  readonly tags: string[]

  constructor(storeName: string, address: string, description: string, tags: string[]) {
    super()
    this.storeName = storeName
    this.address = address
    this.description = description
    this.tags = tags
  }
}

export function createMerchantStoreOnboardingRequestIO(input: CreateStoreRequest): TaskIO<string> {
  return sendAPI(new MerchantCreateStoreOnboardingRequestAPI(input.storeName, input.address, input.description, input.tags))
}
