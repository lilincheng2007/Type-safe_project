/**
 * 对应后端 **order-service**（下单、订单列表内部聚合等；前端仅暴露经网关的结账接口）。
 */
import type { TaskIO } from '@/delivery/io/TaskIO'
import type { CheckoutLine, CheckoutResponse } from '@/delivery/model/api'
import { apiPostIO } from '../client'
import { gatewayPaths } from '../gateway-paths'

export function checkoutIO(lines: CheckoutLine[]): TaskIO<CheckoutResponse> {
  return apiPostIO(gatewayPaths.delivery.customerCheckout, { lines })
}
