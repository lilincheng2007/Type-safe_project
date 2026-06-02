import { APIMessage } from '@/apis/shared/APIMessage'
import type { TaskIO } from '@/apis/shared/TaskIO'
import { sendAPI } from '@/apis/shared/sendAPI'
import type { AISearchRequest } from '@/objects/ai/apiTypes/AISearchRequest'
import type { AISearchResponse } from '@/objects/ai/apiTypes/AISearchResponse'

class AISearchAPI extends APIMessage<AISearchResponse> {
  readonly apiName = 'aisearchapi'
  readonly query: string

  constructor(request: AISearchRequest) {
    super()
    this.query = request.query
  }
}

export function aiSearchIO(request: AISearchRequest): TaskIO<AISearchResponse> {
  return sendAPI(new AISearchAPI(request))
}
