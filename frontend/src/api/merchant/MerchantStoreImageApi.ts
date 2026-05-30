import { APIMessage } from '@/api/shared/APIMessage'
import type { TaskIO } from '@/api/shared/TaskIO'
import { sendAPI } from '@/api/shared/sendAPI'
import type { UpdateStoreImageRequest } from '@/objects/merchant/UpdateStoreImageRequest'
import type { MerchantId } from '@/objects/shared/ids'
import type { OkResponse } from '@/objects/shared/OkResponse'

class MerchantStoreImageAPI extends APIMessage<OkResponse> {
  readonly apiName = 'merchantstoreimageapi'
  readonly merchantId: MerchantId
  readonly imageUrl: string

  constructor(merchantId: MerchantId, imageUrl: string) {
    super()
    this.merchantId = merchantId
    this.imageUrl = imageUrl
  }
}

export function updateMerchantStoreImageIO(merchantId: MerchantId, input: UpdateStoreImageRequest): TaskIO<OkResponse> {
  return sendAPI(new MerchantStoreImageAPI(merchantId, input.imageUrl))
}
