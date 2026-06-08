import type { MerchantStoreProfile } from '@/objects/merchant/MerchantStoreProfile'

export const resolveSelectedStoreId = (currentSelectedStoreId: string | null, stores: MerchantStoreProfile[]) =>
  currentSelectedStoreId && stores.some((store) => store.merchant.id === currentSelectedStoreId)
    ? currentSelectedStoreId
    : (stores[0]?.merchant.id ?? null)

export const normalizeCreateStoreDraft = ({
  name,
  address,
  description,
}: {
  name: string
  address: string
  description: string
}) => {
  const trimmedName = name.trim()
  const trimmedAddress = address.trim()
  const trimmedDescription = description.trim()

  if (!trimmedName || !trimmedAddress || !trimmedDescription) {
    return null
  }

  return {
    storeName: trimmedName,
    address: trimmedAddress,
    description: trimmedDescription,
  }
}

export const normalizeProductCategoryName = (categoryName: string) => categoryName.trim() || '默认分类'
