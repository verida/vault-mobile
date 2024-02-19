import { useContext } from 'react'

import { PolygonIdWitnessContext } from '../contexts'

export function usePolygonIdWitness() {
  const contextValue = useContext(PolygonIdWitnessContext)
  if (!contextValue) {
    throw new Error(
      'usePolygonIdWitness must be used within a PolygonIdProvider'
    )
  }
  return contextValue
}
