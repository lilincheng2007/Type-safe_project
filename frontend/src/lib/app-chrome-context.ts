import { createContext } from 'react'

import type { FeedbackDialogRequest, NoticeTone } from './mock-types'

export interface AppChromeContextValue {
  openFeedbackDialog: (request: FeedbackDialogRequest) => void
  showNotice: (message: string, tone?: NoticeTone) => void
}

export const AppChromeContext = createContext<AppChromeContextValue | null>(null)
