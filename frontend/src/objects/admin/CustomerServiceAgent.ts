import type { CustomerServiceAgentId, ServiceChannel } from '@/objects/shared/ids'

export interface CustomerServiceAgent {
  id: CustomerServiceAgentId
  name: string
  department: string
  channel: ServiceChannel
  ticketIds: string[]
}
