import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { PreviewInspectorBridge } from '@/components/PreviewInspectorBridge'

import { AppChromeProvider } from '@/components/AppChromeProvider'
import { rootElementByIdIO } from '@/api/shared/browser'
import type { TaskIO } from '@/api/shared/TaskIO'
import { runTask } from '@/api/shared/TaskIO'
import { router } from '@/router'

import './index.css'

const renderAppIO: TaskIO<void> = () =>
  runTask(rootElementByIdIO('root')).then((rootElement) => {
    createRoot(rootElement).render(
      <StrictMode>
        <AppChromeProvider>
          <PreviewInspectorBridge />
          <RouterProvider router={router} />
        </AppChromeProvider>
      </StrictMode>,
    )
  })

void runTask(renderAppIO)
