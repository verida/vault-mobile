import { ParsedCaipType } from 'features/caip'
import { maybeParseCaip } from 'features/caip/utils/parseCaip'
import { useActiveWalletConnectSessionChainAccounts } from 'features/walletConnect'
import * as React from 'react'

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

  const caipTypes = React.useMemo<readonly ParsedCaipType[]>(
    // TODO: Make this reusable, we likely do this in a lot of places
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

  return { caipTypes }
}
