import { useEffect, useState } from 'react'

import { getAuthSessionIO, type AuthSession } from '@/lib/auth-session'
import { runTask } from '@/delivery/io/TaskIO'

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false

    void runTask(getAuthSessionIO()).then((nextSession) => {
      if (!cancelled) {
        setSession(nextSession)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  return session
}
