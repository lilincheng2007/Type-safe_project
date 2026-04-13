import type { TaskIO } from '@/delivery/io/TaskIO'
import type { PlatformMetaResponse } from '@/objects/admin/PlatformMetaResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchPlatformMetaIO(): TaskIO<PlatformMetaResponse> {
  return apiGetIO('/delivery/platform-meta')
}
