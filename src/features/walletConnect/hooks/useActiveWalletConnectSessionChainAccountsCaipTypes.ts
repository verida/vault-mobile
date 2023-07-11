import { ParsedCaipType } from 'features/caip'
import { maybeParseCaip } from 'features/caip/utils/parseCaip'
import * as React from 'react'

import { useActiveWalletConnectSessionChainAccounts } from './useActiveWalletConnectSessionChainAccounts'

export function useActiveWalletConnectSessionChainAccountsCaipTypes({
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

  const parsedCaipTypes = React.useMemo<readonly ParsedCaipType[]>(
    () => [
      ...new Set(
        accounts.flatMap((maybeAccount) => {
          if (typeof maybeAccount !== 'string' || !maybeAccount.length)
            return []

          const maybeCaip = maybeParseCaip(maybeAccount)

          if (!maybeCaip) {
            // eslint-disable-next-line no-console
            console.warn(
              `Encountered unsupported account, "${String(maybeAccount)}".`
            )
            return []
          }

          return [maybeCaip]
        })
      ),
    ],
    [accounts]
  )

  return { parsedCaipTypes }
}
