import { PolygonIdContext } from 'contexts/PolygonIdContext'
import { useContext } from 'react'

export function usePolygonId() {
  return useContext(PolygonIdContext)
}