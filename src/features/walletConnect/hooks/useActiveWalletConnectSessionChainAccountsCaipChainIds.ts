import { ChainId } from 'caip'
import * as React from 'react'

import { useActiveWalletConnectSessionChainAccounts } from './useActiveWalletConnectSessionChainAccounts'

export function useActiveWalletConnectSessionChainAccountsCaipChainIds({
  chain,
  walletConnectSessionKey,
}: {
  readonly chain: string
  readonly walletConnectSessionKey: string
}) {
  const accounts = useActiveWalletConnectSessionChainAccounts({
    chain,
    walletConnectSessionKey,
  })

  const caipChainIds = React.useMemo<readonly ChainId[]>(
    () => [
      ...new Set(
        accounts.flatMap((maybeAccount) => {
          if (typeof maybeAccount !== 'string' || !maybeAccount.length)
            return []

          return [new ChainId(maybeAccount)]
        })
      ),
    ],
    [accounts]
  )

  return { caipChainIds }
}
