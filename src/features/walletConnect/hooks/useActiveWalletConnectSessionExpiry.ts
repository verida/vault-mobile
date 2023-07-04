import * as React from 'react'

import { useActiveWalletConnectSession } from './useActiveWalletConnectSession'

export function useActiveWalletConnectSessionExpiry({
  walletConnectSessionKey,
}: {
  readonly walletConnectSessionKey: string | undefined
}): Date | undefined {
  const maybeActiveSession = useActiveWalletConnectSession({
    walletConnectSessionKey,
  })

  return React.useMemo(() => {
    if (!maybeActiveSession) return undefined

    const { expiry } = maybeActiveSession

    if (typeof expiry !== 'number') return undefined

    return new Date(expiry * 1000) /* seconds_to_milliseconds */
  }, [maybeActiveSession])
}
