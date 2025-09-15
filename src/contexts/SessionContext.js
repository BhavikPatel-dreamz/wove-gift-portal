
'use client'

import { createContext, useContext } from 'react'

export const SessionContext = createContext(null)

export function SessionProvider({ children, session }) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const session = useContext(SessionContext)
  if (session === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return session
}
