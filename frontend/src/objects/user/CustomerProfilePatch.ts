import type { CustomerDeliveryContact } from './CustomerDeliveryContact'

export interface CustomerProfilePatch {
  defaultAddress?: string
  name?: string
  phone?: string
  deliveryContacts?: CustomerDeliveryContact[]
}
