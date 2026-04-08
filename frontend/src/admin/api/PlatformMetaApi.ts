import type { TaskIO } from '@/delivery/io/TaskIO'
import type { PlatformMetaResponse } from '../objects/PlatformMetaResponse'
import { apiGetIO } from '@/shared/http/client'

export function fetchPlatformMetaIO(): TaskIO<PlatformMetaResponse> {
  return apiGetIO('/delivery/platform-meta')
}
