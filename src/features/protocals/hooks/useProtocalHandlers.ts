import { useMemo } from 'react'

import { processDeeplink, processQR } from '../registry'

export function useProtocalsHandlers() {
  return useMemo(
    () => ({
      processDeeplink,
      processQR,
    }),
    []
  )
}
