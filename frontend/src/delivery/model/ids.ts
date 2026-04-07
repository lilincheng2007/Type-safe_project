/**
 * 与后端 `delivery/model` 各实体中的 id 字段语义对齐（前端用类型别名约束）。
 */

export type UserId = string
export type MerchantId = string
export type RiderId = string
export type CustomerServiceAgentId = string
export type OperationsManagerId = string
export type ProductId = string
export type OrderId = string
export type VoucherId = string
export type CampaignId = string

export type UserRole = 'customer' | 'merchant' | 'rider' | 'admin'

export type MerchantCategory = '中餐' | '西餐' | '零售' | '饮品甜点' | '夜宵'

export type RiderStatus = '空闲' | '接单' | '配送中'

export type ServiceChannel = '在线' | '电话'

export type OrderStatus = '待接单' | '制作中' | '配送中' | '已完成' | '已取消'
