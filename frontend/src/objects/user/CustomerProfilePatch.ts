import type { CustomerDeliveryContact } from './CustomerDeliveryContact'

export interface CustomerProfilePatch {
  walletBalance?: number
  defaultAddress?: string
  name?: string
  phone?: string
  deliveryContacts?: CustomerDeliveryContact[]
}
