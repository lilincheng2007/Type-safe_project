export const storeTagOptions = ['中餐', '西餐', '饮品甜点', '其它'] as const

export type StoreTag = (typeof storeTagOptions)[number]
