import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { PreviewInspectorBridge } from '@/components/PreviewInspectorBridge'

import { AppChromeProvider } from '@/components/AppChromeProvider'
import { router } from '@/router'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppChromeProvider>
      <PreviewInspectorBridge />
      <RouterProvider router={router} />
    </AppChromeProvider>
  </StrictMode>,
)
