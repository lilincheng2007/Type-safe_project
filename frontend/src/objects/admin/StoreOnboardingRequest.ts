export type StoreOnboardingStatus = 'pending' | 'accepted' | 'rejected'

export interface StoreOnboardingRequest {
  id: string
  ownerUsername: string
  storeName: string
  address: string
  description: string
  tags: string[]
  status: StoreOnboardingStatus
  rejectionReason?: string | null
  reviewedBy?: string | null
  createdAt: string
  reviewedAt?: string | null
}
