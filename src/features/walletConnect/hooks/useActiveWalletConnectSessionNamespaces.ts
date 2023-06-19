import { SessionTypes } from '@walletconnect/types'
import { useActiveWalletConnectSession } from 'features/walletConnect'
import * as React from 'react'
import Namespaces = SessionTypes.Namespaces

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
