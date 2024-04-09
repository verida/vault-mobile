import * as React from 'react'

import { Namespaces } from '../types'
import { useActiveWalletConnectSession } from './useActiveWalletConnectSession'

export function useActiveWalletConnectSessionNamespaces({
  walletConnectSessionKey,
}: {
  readonly walletConnectSessionKey: string | undefined
}): Namespaces /* {[chainId]: Namespace} */ {
  const maybeActiveSession = useActiveWalletConnectSession({
    walletConnectSessionKey,
  })

  return React.useMemo(
    () => maybeActiveSession?.namespaces || {},
    [maybeActiveSession]
  )
}
