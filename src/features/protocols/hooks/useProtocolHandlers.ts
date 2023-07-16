import { usePolygonIdProtocolHandler } from 'features/polygonid'
import type { ProtocolHandler } from 'features/protocols'
import { useRef } from 'react'

export function useProtocolHandlers() {
  const handlersRef = useRef<ProtocolHandler[]>([])

  // Get handlers from their feature folders
  // A handler is considered synchronous, refactor if needed
  const polygonIdProtocolHandler = usePolygonIdProtocolHandler()

  // Add other protocols in the array, by order of priority
  handlersRef.current = [polygonIdProtocolHandler]

  return handlersRef
}
