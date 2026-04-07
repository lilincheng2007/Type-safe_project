/**
 * 对应后端 **admin-service**（运营总览、工单面板、平台元数据；部分数据由该服务聚合其他微服务）。
 */
import type { TaskIO } from '@/delivery/io/TaskIO'
import type { DeliveryOverviewResponse, OrdersPanelResponse, PlatformMetaResponse } from '@/delivery/model/api'
import { apiGetIO } from '../client'
import { gatewayPaths } from '../gateway-paths'

const { delivery } = gatewayPaths

export function fetchDeliveryOverviewIO(): TaskIO<DeliveryOverviewResponse> {
  return apiGetIO(delivery.overview)
}

export function fetchOrdersPanelIO(): TaskIO<OrdersPanelResponse> {
  return apiGetIO(delivery.ordersPanel)
}

export function fetchPlatformMetaIO(): TaskIO<PlatformMetaResponse> {
  return apiGetIO(delivery.platformMeta)
}
