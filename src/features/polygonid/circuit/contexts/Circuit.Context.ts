import * as React from 'react'

import { CircuitContextValue } from '../@types'

const CircuitContext = React.createContext<CircuitContextValue | null>(null)

export const CircuitContextProvider = CircuitContext.Provider

export function useCircuitContext(): CircuitContextValue {
  const maybeContext = React.useContext(CircuitContext)

  if (!maybeContext) throw new Error('Missing <CircuitContextProvider />.')

  return maybeContext
}
