import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { UpdateStoreImageRequest } from '@/objects/merchant/apiTypes/UpdateStoreImageRequest'
import type { MerchantId } from '@/objects/shared/ids'
import type { OkResponse } from '@/objects/shared/apiTypes/OkResponse'

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
