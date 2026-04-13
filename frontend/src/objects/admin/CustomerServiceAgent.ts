import type { CustomerServiceAgentId, ServiceChannel } from '@/delivery/model/ids'

export interface CustomerServiceAgent {
  id: CustomerServiceAgentId
  name: string
  department: string
  channel: ServiceChannel
  ticketIds: string[]
}
