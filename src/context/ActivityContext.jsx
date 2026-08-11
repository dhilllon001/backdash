import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CURRENT_ACTOR, INITIAL_ACTIVITY } from '../data/activityLog.js'

const ActivityContext = createContext(null)

let seq = 100

export function ActivityProvider({ children }) {
  const [entries, setEntries] = useState(INITIAL_ACTIVITY)

  const logActivity = useCallback((partial) => {
    const entry = {
      id: `act-${++seq}`,
      at: new Date().toISOString(),
      actor: {
        name: CURRENT_ACTOR.name,
        initials: CURRENT_ACTOR.initials,
      },
      ...partial,
    }
    setEntries((list) => [entry, ...list])
    return entry
  }, [])

  const value = useMemo(() => ({ entries, logActivity }), [entries, logActivity])

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
}

export function useActivity() {
  const ctx = useContext(ActivityContext)
  if (!ctx) throw new Error('useActivity must be used within ActivityProvider')
  return ctx
}
