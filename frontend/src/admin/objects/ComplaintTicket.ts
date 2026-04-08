import type { OrderId } from '@/delivery/model/ids'

export interface ComplaintTicket {
  id: string
  orderId: OrderId
  customerName: string
  summary: string
  severity: '低' | '中' | '高'
  status: '待处理' | '处理中' | '已解决'
}
