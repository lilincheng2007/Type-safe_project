import { useEffect, useState } from 'react'

import {
  AUTH_SESSION_KEY,
  AUTH_SESSION_UPDATED_EVENT,
  readAuthSession,
  type AuthSession,
} from '@/lib/auth-session'

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null | undefined>(() => readAuthSession())

  useEffect(() => {
    const syncSession = () => {
      setSession(readAuthSession())
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === AUTH_SESSION_KEY) {
        syncSession()
      }
    }

    window.addEventListener(AUTH_SESSION_UPDATED_EVENT, syncSession)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener(AUTH_SESSION_UPDATED_EVENT, syncSession)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  return session
}
