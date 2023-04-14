import * as React from 'react'

import { PolygonContextValue } from '../@types'

const PolygonContext = React.createContext<PolygonContextValue | null>(null)

export const PolygonContextProvider = PolygonContext.Provider

export function usePolygonContext(): PolygonContextValue {
  const maybeContext = React.useContext(PolygonContext)

  if (!maybeContext) throw new Error('Missing <PolygonContextProvider />')

  return maybeContext
}
