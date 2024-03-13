import { useContext } from 'react'

import { PolygonIdManagerContext, PolygonIdProtocolContext } from '../contexts'

export function usePolygonId() {
  const polygonIdManagerContext = useContext(PolygonIdManagerContext)
  const polygonIdProtocolContext = useContext(PolygonIdProtocolContext)

  if (!polygonIdManagerContext || !polygonIdProtocolContext) {
    throw new Error('usePolygonId must be used within a PolygonIdProvider')
  }

  return { ...polygonIdManagerContext, ...polygonIdProtocolContext }
}
