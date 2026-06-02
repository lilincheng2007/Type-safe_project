import { UserRoles } from '@/objects/shared/ids'
import type { UserRole } from '@/objects/shared/ids'

export const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: UserRoles.customer, label: '顾客' },
  { value: UserRoles.merchant, label: '商家' },
  { value: UserRoles.rider, label: '骑手' },
]

export function getRoleLabel(role: UserRole) {
  if (role === UserRoles.customer) return '顾客'
  if (role === UserRoles.merchant) return '商家'
  return '骑手'
}
