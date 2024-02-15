import { useContext } from 'react'

import {
  NewPolygonIdManagerContext,
  PolygonIdProtocolContext,
} from '../contexts'

export function useNewPolygonId() {
  const polygonIdManagerContext = useContext(NewPolygonIdManagerContext)
  const polygonIdProtocolContext = useContext(PolygonIdProtocolContext)

  if (!polygonIdManagerContext || !polygonIdProtocolContext) {
    throw new Error(
      'useNewPolygonId must be used within a NewPolygonIdProvider'
    )
  }

  return { ...polygonIdManagerContext, ...polygonIdProtocolContext }
}
