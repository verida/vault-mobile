import { useEffect, useRef } from 'react'

// TODO: Remove the export default
// TODO: Add a generic to the function of type unknown by default: `usePrevious<T = unknown>(value: T): T | undefined` so it is strongly typed
// TODO: Actually, this hook is unused, to delete
function usePrevious(value: any) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}
export default usePrevious
