import type { TaskIO } from '@/api/shared/TaskIO'
import type { OkResponse } from '@/objects/shared/OkResponse'
import { ApiError, runTask } from '@/api/shared/client'
import { apiPostIO } from '@/api/shared/client'

export function finishMerchantOrderCookingIO(orderId: string): TaskIO<OkResponse> {
  return async () => {
    try {
      return await runTask(apiPostIO(`/merchant/me/orders/${orderId}/finish`))
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return runTask(apiPostIO(`/merchant/me/orders/${orderId}/ready`))
      }
      throw error
    }
  }
}
