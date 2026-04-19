import type { RootInfoModule } from './RootInfoModule'

export interface RootInfoResponse {
  service: string
  message: string
  modules: Record<string, RootInfoModule>
}
