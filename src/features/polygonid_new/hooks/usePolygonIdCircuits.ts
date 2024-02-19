import { useContext } from 'react'

import { PolygonIdCircuitsContext } from '../contexts'

export function usePolygonIdCircuits() {
  const contextValue = useContext(PolygonIdCircuitsContext)
  if (!contextValue) {
    throw new Error(
      'usePolygonIdCircuits must be used within a PolygonIdCircuitsProvider'
    )
  }
  return contextValue
}
