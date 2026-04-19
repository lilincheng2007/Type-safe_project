import type { TaskIO } from '@/api/shared/TaskIO'
import type { PlatformMetaResponse } from '@/objects/admin/PlatformMetaResponse'
import { apiGetIO } from '@/api/shared/client'

export function fetchPlatformMetaIO(): TaskIO<PlatformMetaResponse> {
  return apiGetIO('/admin/platform-meta')
}
