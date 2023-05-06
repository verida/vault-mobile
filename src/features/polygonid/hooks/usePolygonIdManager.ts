import { useContext } from 'react'

import { PolygonIdManagerContext } from '../contexts'

export function usePolygonIdManager() {
  const contextValue = useContext(PolygonIdManagerContext)
  if (contextValue === null) {
    throw new Error(
      'usePolygonIdManager must be used within a PolygonIdManagerProvider'
    )
  }
  return contextValue
}
