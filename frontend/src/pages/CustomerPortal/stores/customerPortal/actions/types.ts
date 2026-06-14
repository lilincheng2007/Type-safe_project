import type { CustomerPortalStore } from '../types'

export type CustomerPortalSet = (
  partial: Partial<CustomerPortalStore> | ((state: CustomerPortalStore) => Partial<CustomerPortalStore> | {}),
) => void

export type CustomerPortalGet = () => CustomerPortalStore
