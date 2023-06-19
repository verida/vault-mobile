import * as React from 'react'

import { NearContextValue } from '../@types'

const NearContext = React.createContext<NearContextValue | null>(null)

export const NearContextProvider = NearContext.Provider

export function useNearContext(): NearContextValue {
  const maybeContext = React.useContext(NearContext)

  if (!maybeContext) throw new Error('Missing <NearContextProvider />!')

  return maybeContext
}
