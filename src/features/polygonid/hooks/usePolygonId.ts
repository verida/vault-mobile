import { usePolygonIdManager } from './usePolygonIdManager'

export function usePolygonId() {
  const polygonIdManager = usePolygonIdManager()

  return {
    ...polygonIdManager,
  }
}
